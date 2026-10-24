import { validateLoginInput, validateNewPassword, validateBoundedText, validateDocumentMeta, validatePositiveAmount, isValidAadhaar } from '../validation';
import { sanitizeTeacherList, sanitizeStudent } from '../privacy';

describe('audit security validators', () => {
  test('AUTH: login shape rejects bad email and oversize password', () => {
    expect(validateLoginInput('not-an-email', 'x')).toMatch(/valid email/i);
    expect(validateLoginInput('a@b.co', '')).toMatch(/password/i);
    expect(validateLoginInput('a@b.co', 'x'.repeat(257))).toMatch(/too long/i);
    expect(validateLoginInput('teacher1@school.com', 'TempPass123!')).toBeNull();
  });

  test('AUTH: password change enforces length + match', () => {
    expect(validateNewPassword('short', 'short')).toMatch(/8 characters/);
    expect(validateNewPassword('longenough1', 'different1')).toMatch(/match/);
    expect(validateNewPassword('longenough1', 'longenough1')).toBeNull();
  });

  test('CHAT/API: bounded text rejects empty + oversize', () => {
    expect(validateBoundedText('', 'Message', 2000)).toMatch(/required/);
    expect(validateBoundedText('x'.repeat(2001), 'Message', 2000)).toMatch(/under 2000/);
    expect(validateBoundedText('hello', 'Message', 2000)).toBeNull();
  });

  test('FILE: document allow-list rejects executables and traversal', () => {
    expect(validateDocumentMeta('run.exe', 'Other Document')).toMatch(/not allowed/);
    expect(validateDocumentMeta('../secret', 'Other Document')).toMatch(/invalid characters/);
    expect(validateDocumentMeta('Aadhaar Card (Front and Back)', 'Aadhaar Card')).toBeNull();
  });

  test('PAY: positive amount check', () => {
    expect(validatePositiveAmount(0)).toMatch(/positive/);
    expect(validatePositiveAmount(-5)).toMatch(/positive/);
    expect(validatePositiveAmount(16000)).toBeNull();
  });

  test('PRIV: aadhaar shape check', () => {
    expect(isValidAadhaar('123')).toBe(false);
    expect(isValidAadhaar('123456789012')).toBe(true);
  });

  test('PRIV: teacher roster hides parent contact + medical', () => {
    const full: any = {
      id: 22, name: 'Aarav', parentPhone: '999', parentEmail: 'p@x',
      address: 'Delhi', dob: '2010-01-01', medicalConditions: 'Asthma',
      aadhaar: '123456789012', className: 'Class 10',
    };
    const teacherView: any = sanitizeStudent(full, { role: 'teacher' } as any);
    expect(teacherView.parentPhone).toBeUndefined();
    expect(teacherView.medicalConditions).toBeUndefined();
    expect(teacherView.name).toBe('Aarav');
    const adminView: any = sanitizeStudent(full, { role: 'school_admin' } as any);
    expect(adminView.parentPhone).toBe('999');
    void sanitizeTeacherList;
  });
});
