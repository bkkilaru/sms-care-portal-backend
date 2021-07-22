import DefaultResponses from './defaultResponses';

describe('Outreach responses tests', () => {
  it('Gets outreach messages', () => {
    const firstResponse = DefaultResponses.first.spanish(
      'Michael',
      'Bryant',
      'NBA',
    );

    expect(firstResponse[0].includes('Michael')).toBeTruthy();
    expect(firstResponse.length).toBe(4);

    const secondResponse = DefaultResponses.second.english();

    expect(secondResponse[1].includes('https')).toBeTruthy();
    expect(secondResponse.length).toBe(5);

    const thirdResponse = DefaultResponses.third.english();

    expect(thirdResponse[2].includes('Give it a try')).toBeTruthy();
    expect(thirdResponse.length).toBe(3);

    const responseYes = DefaultResponses.yes.english();

    expect(responseYes[0].includes('Welcome')).toBeTruthy();
    expect(responseYes.length).toBe(1);
  });
});
