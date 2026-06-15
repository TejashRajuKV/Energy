const submitContact = async (req, res) => {
  // Log to console for MVP — connect to CRM or email in production
  console.log('[CONTACT FORM]', req.body);
  res.json({ message: 'Thank you for reaching out. We will be in touch shortly.' });
};

module.exports = { submitContact };
