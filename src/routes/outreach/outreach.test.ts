import outreachMessageTextsBuilder from './outreachMessageTextsBuilder';

describe('Outreach responses tests', () => {
  it('Gets outreach messages', () => {
    const firstResponse = outreachMessageTextsBuilder({
      coachName: 'Michael',
      patientName: 'Bryant',
      clinicName: 'NBA',
      outreachStage: 'zero',
      isSpanishMessage: false,
    });

    expect(firstResponse[0].includes('Michael')).toBeTruthy();
    expect(firstResponse.length).toBe(4);

    const secondResponse = outreachMessageTextsBuilder({
      outreachStage: 'first',
      isSpanishMessage: false,
    });

    expect(secondResponse[1].includes('https')).toBeTruthy();
    expect(secondResponse.length).toBe(5);

    const thirdResponse = outreachMessageTextsBuilder({
      outreachStage: 'second',
      isSpanishMessage: false,
    });

    expect(thirdResponse[2].includes('Give it a try')).toBeTruthy();
    expect(thirdResponse.length).toBe(3);

    const responsePatientRequestedContact = outreachMessageTextsBuilder({
      outreachStage: 'patientRequestedContact',
      isSpanishMessage: false,
    });

    expect(responsePatientRequestedContact[0].includes('Welcome')).toBeTruthy();
    expect(responsePatientRequestedContact.length).toBe(1);
  });
});
