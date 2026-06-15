const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Patient = require("../models/Patient");
const sendEmail = require("./sendEmail");

const startReminderCron = () => {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏰ Running appointment reminder cron...");

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const appointments = await Appointment.find({ date: tomorrowStr })
        .populate("patient", "name")
        .populate("doctor", "name specialization");

      console.log(`Found ${appointments.length} appointments for tomorrow (${tomorrowStr})`);

      for (const apt of appointments) {
        if (!apt.patient || !apt.doctor) continue;
        if (apt.status === "cancelled") continue;

        const patientDoc = await Patient.findById(apt.patient._id);
        const userDoc = await User.findById(patientDoc?.user);

        if (userDoc?.email) {
          await sendEmail({
            to: userDoc.email,
            subject: "⏰ Appointment Reminder — Tomorrow!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
                </div>
                <div style="padding: 24px;">
                  <h2 style="color: #f59e0b;">⏰ Appointment Reminder!</h2>
                  <p style="color: #374151;">Hi <strong>${apt.patient?.name}</strong>,</p>
                  <p style="color: #374151;">This is a reminder that you have an appointment <strong>tomorrow</strong>!</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background: #fffbeb;">
                      <td style="padding: 10px; font-weight: bold; color: #f59e0b;">Doctor</td>
                      <td style="padding: 10px; color: #374151;">${apt.doctor?.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; color: #f59e0b;">Specialization</td>
                      <td style="padding: 10px; color: #374151;">${apt.doctor?.specialization}</td>
                    </tr>
                    <tr style="background: #fffbeb;">
                      <td style="padding: 10px; font-weight: bold; color: #f59e0b;">Date</td>
                      <td style="padding: 10px; color: #374151;">${apt.date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; color: #f59e0b;">Time</td>
                      <td style="padding: 10px; color: #374151;">${apt.time}</td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; font-size: 13px;">Please arrive 10 minutes early.</p>
                  <p style="color: #374151;">See you tomorrow! 💙</p>
                </div>
              </div>
            `,
          });
          console.log(`✅ Reminder sent to ${userDoc.email}`);
        }
      }

      // Send daily summary to admin
      if (appointments.length > 0) {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: `📋 Tomorrow's Appointments Summary — ${tomorrowStr}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
                </div>
                <div style="padding: 24px;">
                  <h2 style="color: #7c3aed;">📋 Tomorrow's Appointments</h2>
                  <p style="color: #374151;"><strong>${appointments.length}</strong> appointments scheduled for <strong>${tomorrowStr}</strong></p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background: #f5f3ff;">
                      <th style="padding: 10px; text-align: left; color: #7c3aed;">Patient</th>
                      <th style="padding: 10px; text-align: left; color: #7c3aed;">Doctor</th>
                      <th style="padding: 10px; text-align: left; color: #7c3aed;">Time</th>
                      <th style="padding: 10px; text-align: left; color: #7c3aed;">Status</th>
                    </tr>
                    ${appointments.map(apt => `
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px; color: #374151;">${apt.patient?.name || "N/A"}</td>
                        <td style="padding: 10px; color: #374151;">${apt.doctor?.name || "N/A"}</td>
                        <td style="padding: 10px; color: #374151;">${apt.time}</td>
                        <td style="padding: 10px; color: #374151;">${apt.status}</td>
                      </tr>
                    `).join("")}
                  </table>
                </div>
              </div>
            `,
          });
        }
      }

    } catch (error) {
      console.error("Cron error:", error.message);
    }
  });

  console.log("✅ Reminder cron job started!");
};

module.exports = startReminderCron;