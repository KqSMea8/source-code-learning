import uuid from '../../src/utils/uuid';

describe('uuid', () => {
  it('生成一个19位的数字', () => {
    expect(uuid().length).toBe(19);
  });
});