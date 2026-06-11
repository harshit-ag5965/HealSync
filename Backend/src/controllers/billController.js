const Bill = require("../models/Bill");

const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name")
      .populate("doctor", "name specialization fees")
      .populate("appointment", "date time");
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsPaid = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: "paid" },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.status(200).json({ message: "Bill marked as paid", bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDoctorEarnings = async (req, res) => {
  try {
    const Doctor = require("../models/Doctor");
    
    // Find doctor profile linked to logged-in user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const bills = await Bill.find({ doctor: doctor._id })
      .populate("patient", "name")
      .populate("appointment", "date time status");

    const totalEarnings = bills
      .filter(b => b.status === "paid")
      .reduce((sum, b) => sum + b.amount, 0);

    const totalBills = bills.length;
    const paidBills = bills.filter(b => b.status === "paid").length;
    const unpaidBills = bills.filter(b => b.status === "unpaid").length;

    // Monthly breakdown
    const monthlyMap = {};
    bills.forEach(bill => {
      const month = new Date(bill.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      if (bill.status === "paid") monthlyMap[month] += bill.amount;
    });

    const monthly = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));

    res.status(200).json({ totalEarnings, totalBills, paidBills, unpaidBills, bills, monthly });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getAllBills, markAsPaid, getDoctorEarnings };