import '@testing-library/jest-dom';

beforeAll(() => {
    const warnSpy = jest.spyOn(console, 'warn');
    warnSpy.mockImplementation(() => {});
});

afterAll(() => {
    const warnSpy = jest.spyOn(console, 'warn');
    warnSpy.mockRestore();
});