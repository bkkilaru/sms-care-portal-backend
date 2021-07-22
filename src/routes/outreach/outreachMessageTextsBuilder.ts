const outreachMessageTextsBuilder = ({
  coachName,
  patientName,
  clinicName,
  outreachStage,
  isSpanishMessage = false,
}: {
  coachName?: string;
  patientName?: string;
  clinicName?: string;
  outreachStage: 'first' | 'second' | 'third' | 'patientRequestedContact';
  isSpanishMessage: boolean;
}) => {
  switch (outreachStage) {
    case 'first':
      if (isSpanishMessage) {
        return [
          `Hola, ${patientName} 😊, su equipo de salud de la Clínica ${clinicName} le refirió para el programa Saludable en Casa. ¡Soy ${coachName}, y me gustaría contarle más!`,
          'Vivir con Diabetes es agobiante. Le hace difícil tener la vida saludable, y sin-cuidados que merece.',
          'No está solo 🤝 . Saludable en Casa es un programa GRATIS de 12 semanas de coaching o consejería de diabetes, en su teléfono.',
          '¿Le gustaría unirse? Es GRATIS. Conteste SI para unirle a su coach o consejero de diabetes, o ponga MAS para aprender más 😊.',
        ];
      }
      return [
        `Hi ${patientName}, your team at ${clinicName} 🏥 referred you to join the Healthy At Home Program. This is ${coachName} and I can tell you more.`,
        'Diabetes is overwhelming. It can keep you from the long, worry-free life you deserve.',
        'You’re not alone 🤝 Healthy at Home is a FREE 12-week diabetes coaching program on your phone 📱',
        'Want to join for FREE? Respond YES to get set up with your diabetes coach or MORE to learn more.',
      ];
    case 'second':
      if (isSpanishMessage) {
        return [
          'Bien! Hemos ayudado a mucha gente como usted a mejorar y manejar su diabetes en casa, por telefono. Vealo por usted mismo:',
          'https://images.squarespace-cdn.com/content/v1/60a29ddb5011f2319bff75c9/0338184a-b641-479b-8fa3-9b385f4e13e8/7.png?format=500w',
          'https://images.squarespace-cdn.com/content/v1/60a29ddb5011f2319bff75c9/dc6c946e-1610-423e-9ea9-230836205f84/5.png?format=500w',
          `Así es como funciona:
            1. Le llamamos para contarle más
            2. Programe una llamada con su coach
            3. Empiece a sentirse mejor
            `,
          '¿Listo para comenzar? Conteste SI para unirle a su coach de diabetes o MÁS para más información.',
        ];
      }
      return [
        'Great! We’ve helped people like you manage their diabetes at home. See for yourself:',
        'https://images.squarespace-cdn.com/content/v1/5ce04d00b68cbf00010e0c76/1600802045596-CU5OJLB15MZJ7RHA9JDH/ke17ZwdGBToddI8pDm48kEpT_Wb2Q40Qb6WVkh_pUN4UqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYy7Mythp_T-mtop-vrsUOmeInPi9iDjx9w8K4ZfjXt2duPVlUW5KossE0diiPzOT_7_ZXpOrcaDhMW_HAe3F34eCjLISwBs8eEdxAxTptZAUg/4.png?format=500w',
        'https://images.squarespace-cdn.com/content/v1/5ce04d00b68cbf00010e0c76/1620158314094-I08MPXQHBBDBPXK5XQ9S/ke17ZwdGBToddI8pDm48kEpT_Wb2Q40Qb6WVkh_pUN4UqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYy7Mythp_T-mtop-vrsUOmeInPi9iDjx9w8K4ZfjXt2duPVlUW5KossE0diiPzOT_7_ZXpOrcaDhMW_HAe3F34eCjLISwBs8eEdxAxTptZAUg/5.png?format=500w',
        `Here’s how it works
          1. We call you to tell you more
          2. Schedule a visit
          3. Start feeling great!
          `,
        'Ready to start? Respond YES to get set up with your diabetes coach or MORE to learn more',
      ];
    case 'third':
      if (isSpanishMessage) {
        return [
          '¡Fabuloso! Este programa es GRATUITO y muy valioso. ¡Comience pronto, no pierda la oportunidad!',
          'Quiero que sepa que funciona desde cualquier teléfono, y puede parar ✋ si lo necesita.',
          `Pruébelo ✨
            Responda SI para unirle a su coach de Diabetes, o MÁS para más información.
            `,
        ];
      }
      return [
        'Wonderful! This valuable program is FREE to you and it’s starting now, so don’t miss out!',
        'We want you to know you can stop ✋ if you need and it works on any phone 📱.',
        `Give it a try ✨
          Respond YES to get set up with your diabetes coach or to learn more.
          `,
      ];
    case 'patientRequestedContact':
      if (isSpanishMessage) {
        return [
          'Bienvenido a Salud en casa! Al unirte has tomado el paso 1️⃣ para tu salud. 💪',
        ];
      }
      return [
        'Welcome to Healthy at Home! By joining, you’ve taken step 1️⃣ for your health. 💪',
      ];
    default:
      if (isSpanishMessage) {
        return [
          '¡Fabuloso! Este programa es GRATUITO y muy valioso. ¡Comience pronto, no pierda la oportunidad!',
          'Quiero que sepa que funciona desde cualquier teléfono, y puede parar ✋ si lo necesita.',
          `Pruébelo ✨
            Responda SI para unirle a su coach de Diabetes, o MÁS para más información.
            `,
        ];
      }
      return [
        'Wonderful! This valuable program is FREE to you and it’s starting now, so don’t miss out!',
        'We want you to know you can stop ✋ if you need and it works on any phone 📱.',
        `Give it a try ✨
          Respond YES to get set up with your diabetes coach or to learn more.
          `,
      ];
  }
};

export default outreachMessageTextsBuilder;
