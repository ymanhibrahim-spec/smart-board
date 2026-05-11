import React from 'react'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { translations } from '../utils/translations'

const Pricing = () => {
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  const plans = [
    {
      name: t.freePlan,
      price: '0',
      features: [
        { text: lang === 'ar' ? 'سبورة ذكية أساسية' : 'Basic Smart Board', included: true },
        { text: lang === 'ar' ? 'حفظ حتى 3 دروس' : 'Save up to 3 lessons', included: true },
        { text: lang === 'ar' ? 'ملاحظات يدوية' : 'Manual notes', included: true },
        { text: lang === 'ar' ? 'تصدير PDF أساسي' : 'Basic PDF Export', included: true },
        { text: lang === 'ar' ? 'تحويل الصوت لنص' : 'Audio to Text', included: false },
        { text: lang === 'ar' ? 'ملخص AI' : 'AI Summary', included: false },
      ],
      btnText: lang === 'ar' ? 'ابدأ مجاناً' : 'Start Free',
      popular: false
    },
    {
      name: t.proPlan,
      price: '10',
      features: [
        { text: lang === 'ar' ? 'دروس غير محدودة' : 'Unlimited lessons', included: true },
        { text: lang === 'ar' ? 'تحويل الصوت لنص' : 'Audio to Text', included: true },
        { text: lang === 'ar' ? 'ملخصات AI ذكية' : 'Smart AI Summaries', included: true },
        { text: lang === 'ar' ? 'تصدير PDF احترافي' : 'Pro PDF Export', included: true },
        { text: lang === 'ar' ? 'مشاركة عبر QR Code' : 'QR Code Sharing', included: true },
        { text: lang === 'ar' ? 'إنشاء اختبارات آلي' : 'Auto Quiz Generation', included: true },
      ],
      btnText: lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now',
      popular: true
    },
    {
      name: t.ultraPlan,
      price: '100',
      features: [
        { text: lang === 'ar' ? 'كل مميزات Pro' : 'All Pro features', included: true },
        { text: lang === 'ar' ? 'لوحة تحكم مدرسية' : 'School Dashboard', included: true },
        { text: lang === 'ar' ? 'دعم معلمي المدرسة' : 'Teacher Support', included: true },
        { text: lang === 'ar' ? 'مزامنة سحابية' : 'Cloud Sync', included: true },
        { text: lang === 'ar' ? 'دخول للطلاب' : 'Student Access', included: true },
        { text: lang === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics', included: true },
      ],
      btnText: lang === 'ar' ? 'تواصل للمدارس' : 'Contact for Schools',
      popular: false
    }
  ]

  const handleSubscribe = (planName) => {
    alert(lang === 'ar' ? `شكراً لاهتمامك بـ ${planName}!` : `Thank you for your interest in ${planName}!`)
  }

  return (
    <div className="container section-padding">
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>{t.pricingTitle}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t.pricingDesc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {plans.map((plan, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }}
            className="glass-morphism" 
            style={{ 
              padding: '40px', 
              position: 'relative', 
              border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: plan.popular 
                ? 'linear-gradient(135deg, var(--white), rgba(59, 130, 246, 0.05))' 
                : 'var(--white)',
              transition: 'var(--transition)'
            }}
          >
            {plan.popular && (
              <span style={{ 
                position: 'absolute', 
                top: '-15px', 
                right: lang === 'ar' ? '20px' : 'auto',
                left: lang === 'en' ? '20px' : 'auto',
                background: 'var(--primary)', 
                color: 'white', 
                padding: '5px 15px', 
                borderRadius: '20px', 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                zIndex: 10
              }}>
                {lang === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
              </span>
            )}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: 'var(--text-dark)' }}>{plan.name}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '30px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{plan.price}</span>
              <span style={{ color: 'var(--text-muted)' }}>{t.currency}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
              {plan.features.map((feature, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: feature.included ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                  {feature.included ? <Check size={18} color="var(--secondary)" /> : <X size={18} style={{ opacity: 0.5 }} />}
                  <span style={{ fontSize: '0.95rem', opacity: feature.included ? 1 : 0.6 }}>{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSubscribe(plan.name)}
              className={plan.popular ? 'btn-primary' : 'btn-outline'} 
              style={{ width: '100%', justifyContent: 'center', padding: '15px' }}
            >
              {plan.btnText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Pricing
