import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APPOINTMENT_TYPES = {
  "Virtual Tour": { duration: 45, conference: true, colorId: "5" },
  "In-Person Viewing": { duration: 60, conference: false, colorId: "2" },
  "Pre-Purchase Inspection": { duration: 120, conference: false, colorId: "6" },
  "Phone Call": { duration: 30, conference: false, colorId: "9" },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      aircraft_id, aircraft_summary, location,
      appointment_type, requested_datetime, duration_minutes,
      client_name, client_email, client_phone, notes,
      source // "public" | "admin"
    } = body;

    if (!appointment_type || !requested_datetime || !client_name) {
      return Response.json({ error: "Missing required fields (appointment_type, requested_datetime, client_name)" }, { status: 400 });
    }

    if (!aircraft_summary) {
      return Response.json({ error: "Missing aircraft summary" }, { status: 400 });
    }

    const typeConfig = APPOINTMENT_TYPES[appointment_type];
    if (!typeConfig) {
      return Response.json({ error: "Invalid appointment type" }, { status: 400 });
    }

    // Parse start datetime and compute end
    const startDate = new Date(requested_datetime);
    if (isNaN(startDate.getTime())) {
      return Response.json({ error: "Invalid requested_datetime" }, { status: 400 });
    }
    const duration = Number(duration_minutes) || typeConfig.duration;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // Get Google Calendar connection (builder's shared account)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");

    const title = `${appointment_type} — ${aircraft_summary}`;
    const description = [
      `Aircraft: ${aircraft_summary}${aircraft_id ? ` (ID: ${aircraft_id})` : ""}`,
      location ? `Location: ${location}` : null,
      ``,
      `Client Name: ${client_name}`,
      client_email ? `Client Email: ${client_email}` : null,
      client_phone ? `Client Phone: ${client_phone}` : null,
      notes ? `` : null,
      notes ? `Notes: ${notes}` : null,
      ``,
      `Scheduled via ${source === "admin" ? "ClearBlue Aero Dashboard" : "ClearBlue Aero Website"}`,
    ].filter(Boolean).join("\n");

    const eventBody = {
      summary: title,
      description,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      location: location || undefined,
      attendees: client_email ? [{ email: client_email, displayName: client_name }] : undefined,
      conferenceData: typeConfig.conference ? { createRequest: { requestId: `cba-${aircraft_id || Date.now()}-${startDate.getTime()}` } } : undefined,
      colorId: typeConfig.colorId,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 * 24 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    const calRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventBody),
      }
    );

    if (!calRes.ok) {
      const errText = await calRes.text();
      return Response.json({ error: `Google Calendar error: ${errText}` }, { status: 502 });
    }

    const event = await calRes.json();

    return Response.json({
      status: "created",
      event_id: event.id,
      html_link: event.htmlLink,
      hangout_link: event.hangoutLink || null,
      start: event.start,
      end: event.end,
      summary: event.summary,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}