import DefaultResponses from './defaultResponses';

describe('Outreach responses tests', () => {
  it('Gets outreach messages', () => {
    const responseZero = DefaultResponses.zero.spanish(
      'Michael',
      'Bryant',
      'NBA',
    );

    expect(responseZero[0].includes('Michael')).toBeTruthy();
    expect(responseZero.length).toBe(4);

    const responseOne = DefaultResponses.one.english();

    expect(responseOne[1].includes('https')).toBeTruthy();
    expect(responseOne.length).toBe(5);

    const responseTwo = DefaultResponses.two.english();

    expect(responseTwo[2].includes('Give it a try')).toBeTruthy();
    expect(responseTwo.length).toBe(3);

    const responseYes = DefaultResponses.yes.english();

    expect(responseYes[0].includes('Welcome')).toBeTruthy();
    expect(responseYes.length).toBe(1);
  });
});
