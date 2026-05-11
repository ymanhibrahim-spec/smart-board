/**
 * Mock AI functions for SmartBoard AI
 */

export const generateAISummary = (transcript) => {
  if (!transcript) return "لم يتم العثور على شرح مسجل لتلخيصه.";
  
  return `هذا ملخص ذكي للدرس بناءً على الشرح الصوتي:
  1. تم شرح المفاهيم الأساسية للموضوع.
  2. تم التطرق لأهم الأمثلة التوضيحية.
  3. تم استنتاج النتائج النهائية للدرس.
  
  ملاحظة: هذا تلخيص آلي فوري.`;
};

export const generateQuiz = (transcript) => {
  return [
    {
      question: "ما هو المفهوم الأساسي الذي تم ذكره في بداية الدرس؟",
      options: ["المفهوم أ", "المفهوم ب", "المفهوم ج", "المفهوم د"],
      answer: 0,
      type: 'mcq'
    },
    {
      question: "هل تعتبر الأمثلة المذكورة كافية لتغطية الموضوع؟",
      answer: true,
      type: 'tf'
    },
    {
      question: "اذكر باختصار أهم استنتاج من الحصة.",
      type: 'short',
      answer: 'إجابة مفتوحة'
    }
  ];
};
