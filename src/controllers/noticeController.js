const Notice = require("../models/noticeModel");

// Create + Update (ek route e) -> notice na thakle create, thakle update
exports.saveNotice = async (req, res) => {
  try {
    const { text, isActive } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Notice text is required" });
    }

    let notice = await Notice.findOne();

    if (!notice) {
      notice = await Notice.create({
        text,
        isActive: isActive !== undefined ? isActive : true,
      });
    } else {
      notice.text = text;
      if (isActive !== undefined) notice.isActive = isActive;
      await notice.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Notice saved", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get notice (dashboard + frontend duita-ei use korbe)
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findOne();
    res.status(200).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};