// Shared helper for tracking leads back to an employee via their QR business-card
// referral code. Used by the public submission functions (contact, sell, valuation).
// Mirrors the affiliate referral flow but for internal sales staff.
export async function trackEmployeeLead(
  base44,
  { code, clientName, email, phone, aircraftSummary, clientId, dealId, sourceForm }
) {
  if (!code) return null;
  try {
    const employees = await base44.asServiceRole.entities.Employee.filter({ referral_code: code });
    if (!employees || employees.length === 0) return null;
    const emp = employees[0];
    if (emp.status === "Inactive") return null;

    await base44.asServiceRole.entities.EmployeeLead.create({
      employee_id: emp.id,
      referral_code: code,
      client_name: clientName,
      client_email: email,
      client_phone: phone,
      aircraft_summary: aircraftSummary || "",
      source_form: sourceForm || "Other",
      client_id: clientId || null,
      deal_id: dealId || null,
      status: "Lead",
    });

    await base44.asServiceRole.entities.Employee.update(emp.id, {
      total_leads: (emp.total_leads || 0) + 1,
      active_leads: (emp.active_leads || 0) + 1,
    });

    // Assign the lead to this sales manager so it shows in their pipeline
    if (clientId) {
      try {
        await base44.asServiceRole.entities.Client.update(clientId, { assigned_to: emp.email });
      } catch (e) {
        console.log("Employee assign-to-client failed (non-blocking):", e.message);
      }
    }

    return emp;
  } catch (err) {
    console.log("Employee tracking failed (non-blocking):", err.message);
    return null;
  }
}