jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
}), { virtual: true });

import { api } from '../../config/api';
import {
  apiLogin,
  apiGetStudent,
  apiGetStudentFeeSummary,
  apiSaveMarksSheet,
  apiGetStudents,
  getStoredUser,
  getStoredToken,
} from '../schoolApi';

describe('Production API Client and Authorization Contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AUTH: successful login saves JWT token and user profile', async () => {
    const mockUser = {
      id: 10,
      email: 'teacher@volpehub.in',
      name: 'Faculty User',
      role: 'teacher',
      mustChangePassword: false,
    };
    const mockToken = 'jwt-prod-token-abc';

    jest.spyOn(api, 'request').mockResolvedValueOnce({
      data: {
        access: mockToken,
        user: mockUser,
      },
    });

    const res = await apiLogin({
      email: 'teacher@volpehub.in',
      password: 'SecurePassword123!',
      role: 'teacher',
    });

    expect(res.token).toBe(mockToken);
    expect(res.user.email).toBe('teacher@volpehub.in');
    expect(getStoredToken()).toBe(mockToken);
    expect(getStoredUser()?.email).toBe('teacher@volpehub.in');
  });

  test('AUTHZ-03: backend 403 Forbidden raises DRF permission denied error', async () => {
    jest.spyOn(api, 'request').mockRejectedValueOnce({
      response: {
        status: 403,
        data: { detail: 'You do not have permission to view this student record.' },
      },
      message: 'Request failed with status code 403',
    });

    await expect(apiGetStudent(999)).rejects.toThrow(
      'You do not have permission to view this student record.'
    );
  });

  test('AUTHZ-04: student cannot save marks when backend rejects with 403', async () => {
    jest.spyOn(api, 'request').mockRejectedValueOnce({
      response: {
        status: 403,
        data: { detail: 'Forbidden: Only assigned teachers can record exam marks.' },
      },
      message: 'Request failed with status code 403',
    });

    await expect(
      apiSaveMarksSheet(1, {
        section: 'A',
        status: 'draft',
        entries: [{ student_id: 22, marks_obtained: 10 }],
      })
    ).rejects.toThrow(/Forbidden/);
  });

  test('AUTH-02: invalid login credentials error is clearly parsed from DRF payload', async () => {
    jest.spyOn(api, 'request').mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'No active account found with the given credentials' },
      },
      message: 'Request failed with status code 401',
    });

    await expect(
      apiLogin({
        email: 'invalid@school.com',
        password: 'wrongpassword',
        role: 'teacher',
      })
    ).rejects.toThrow('No active account found with the given credentials');
  });

  test('PRIV-01: teacher roster sanitization strips sensitive guardian phone and aadhaar', async () => {
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            name: 'Aarav Sharma',
            className: 'Class 10',
            sectionName: 'A',
            rollNo: '12',
            parentName: 'Vikram Sharma',
            parentPhone: '+91 9876543210',
            aadhaar: '123456789012',
          },
        ],
      },
    });

    const list = await apiGetStudents({ limit: 5 });
    expect(list.results.length).toBe(1);
    const student = list.results[0];
    expect(student.name).toBe('Aarav Sharma');
    expect((student as any).parentPhone).toBeUndefined();
    expect((student as any).aadhaar).toBeUndefined();
  });
});
