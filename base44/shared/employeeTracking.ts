// Shared helpers for tracking leads back to an employee via their QR business-card
// referral code. Mirrors the affiliate referral flow but for internal sales staff.
export async function findEmployeeByCode(base44, code) {
  if (!code) return null;
  try {
    const employees = await base44.asServiceRole.entities.Employee.filter({ referral_code: code });
    if (!employees || employees.length === 0) return null;
    const emp = employees[0];
    if (emp.status === "Inactive") return null;
    return emp;
  } catch (err) {
    console.log("Employee lookup failed (non-blocking):", err.message);
    return null;
  }
}

// Records the tracked lead and increments the employee's counters.
// Caller is expected to set Client/Deal `assigned_to` at creation time so the
// Zoho sync automations carry the correct record owner.
export async function recordEmployeeLead(
  base44,
  emp,
  { clientName, email, phone, aircraftSummary, clientId, dealId, sourceForm }
) {
  if (!emp) return null;
  try {
    await base44.asServiceRole.entities.EmployeeLead.create({
      employee_id: emp.id,
      referral_code: emp.referral_code,
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

    return emp;
  } catch (err) {
    console.log("Employee lead recording failed (non-blocking):", err.message);
    return null;
  }
}

// Convenience wrapper: resolve by code, then record.
export async function trackEmployeeLead(base44, { code, ...rest }) {
  const emp = await findEmployeeByCode(base44, code);
  return await recordEmployeeLead(base44, emp, rest);
}