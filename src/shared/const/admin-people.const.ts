import { type AdminCollection } from '@/features/admin/types/admin.types';
import { LESSON_AREAS, LESSON_FORMATS } from '@/shared/const/lesson.const';
import { ACCOUNT_ROLES } from '@/shared/const/roles.const';
import { VERIFICATION_STATUSES } from '@/shared/const/verification.const';

// Accounts, profiles and the files and checks attached to them. Part of ADMIN_COLLECTIONS.
// Secrets (passwordHash, tokenHash) are never listed, so they are never sent to the browser.
export const ADMIN_PEOPLE_COLLECTIONS: AdminCollection[] = [
  {
    key: 'users',
    searchKeys: ['name', 'email'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'name', type: 'text', required: true, inTable: true },
      { key: 'email', type: 'email', required: true, inTable: true },
      { key: 'role', type: 'select', options: ACCOUNT_ROLES, required: true, inTable: true },
      { key: 'emailVerified', type: 'boolean', inTable: true },
      { key: 'avatar', type: 'text' },
      { key: 'password', type: 'password' },
    ],
  },
  {
    key: 'teacherProfiles',
    searchKeys: ['headline', 'bio'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'userId', type: 'objectId', required: true, inTable: true },
      { key: 'headline', type: 'text', inTable: true },
      { key: 'subjects', type: 'stringList', inTable: true },
      { key: 'pricePerLesson', type: 'number', inTable: true },
      { key: 'verified', type: 'boolean', inTable: true },
      { key: 'acceptingStudents', type: 'boolean' },
      { key: 'freeIntro', type: 'boolean' },
      { key: 'bio', type: 'longText' },
      { key: 'experienceYears', type: 'number' },
      { key: 'education', type: 'longText' },
      { key: 'qualifications', type: 'longText' },
      { key: 'lessonFormats', type: 'stringList', options: LESSON_FORMATS },
      { key: 'areas', type: 'stringList', options: LESSON_AREAS },
      { key: 'responseMinutes', type: 'number' },
      { key: 'responseSamples', type: 'number' },
      { key: 'certificates', type: 'json' },
      { key: 'licenses', type: 'json' },
    ],
  },
  {
    key: 'studentProfiles',
    searchKeys: ['bio'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'userId', type: 'objectId', required: true, inTable: true },
      { key: 'bio', type: 'longText', inTable: true },
      { key: 'subjects', type: 'stringList', inTable: true },
    ],
  },
  {
    key: 'availability',
    searchKeys: ['timezone'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'teacherProfileId', type: 'objectId', required: true, inTable: true },
      { key: 'timezone', type: 'text', required: true, inTable: true },
      { key: 'weekly', type: 'json', inTable: true },
      { key: 'exceptions', type: 'json' },
    ],
  },
  {
    key: 'tutorVerifications',
    searchKeys: ['reason', 'reviewerEmail'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'userId', type: 'objectId', required: true, inTable: true },
      { key: 'mediaId', type: 'objectId', required: true },
      { key: 'status', type: 'select', options: VERIFICATION_STATUSES, required: true, inTable: true },
      { key: 'submittedAt', type: 'date', required: true, inTable: true },
      { key: 'reviewedAt', type: 'date', inTable: true },
      { key: 'reviewerEmail', type: 'email' },
      { key: 'reason', type: 'longText' },
    ],
  },
  {
    // Files are uploaded through Cloudinary from the app; removing a record here does not delete the file there.
    key: 'media',
    searchKeys: ['publicId', 'mimeType'],
    canCreate: false, canEdit: true, canDelete: true,
    fields: [
      { key: 'ownerId', type: 'objectId', required: true, inTable: true },
      { key: 'kind', type: 'select', options: ['profile_image', 'qualification'], required: true, inTable: true },
      { key: 'mimeType', type: 'text', required: true, inTable: true },
      { key: 'bytes', type: 'number', required: true, inTable: true },
      { key: 'publicId', type: 'text', required: true },
      { key: 'secureUrl', type: 'text' },
      { key: 'resourceType', type: 'select', options: ['image', 'raw'], required: true },
      { key: 'width', type: 'number' },
      { key: 'height', type: 'number' },
    ],
  },
];
