# TutorConnect - Product Specification

## 1. Product Overview

TutorConnect is a platform that connects students with teachers/tutors.

The main problem we solve is simple:

> Students need an easy way to discover qualified teachers, compare
> them, see their availability and reputation, and communicate with
> them.

Teachers need a place where they can create a professional profile,
present their experience and qualifications, define when they are
available, build their reputation through student ratings, and connect
with potential students.

The platform has two primary user types:

-   **Teacher** - creates and manages a professional tutor profile and
    connects with students.
-   **Student** - creates a learning profile, discovers teachers,
    filters available teachers, and communicates with them.

The product should prioritize trust, discoverability, simple
communication, and a clean user experience.

------------------------------------------------------------------------

# 2. Product Goals

## Primary Goals

1.  Make it easy for students to find suitable teachers.
2.  Give teachers a professional profile that demonstrates their
    experience and qualifications.
3.  Allow students to compare teachers using subjects, experience,
    availability, ratings, and other filters.
4.  Create a trusted rating and review system.
5.  Allow students and teachers to communicate through chat.
6.  Give teachers additional visibility through paid VIP statuses.
7.  Make the platform simple enough that a student can discover and
    contact a teacher quickly.

## Secondary Goals

-   Build a strong teacher reputation system.
-   Make teacher availability visible before starting a conversation.
-   Help teachers understand and manage incoming student interest.
-   Provide a scalable foundation for future booking, payments, lessons,
    and subscription functionality.

------------------------------------------------------------------------

# 3. User Roles

## 3.1 Teacher

A teacher can:

-   Register an account.
-   Create and edit a teacher profile.
-   Add a profile picture.
-   Add their full name and username.
-   Write a professional bio.
-   Select subjects they teach.
-   Add teaching experience.
-   Add certificates.
-   Add licenses where applicable.
-   Add other qualifications.
-   Define their availability calendar.
-   Communicate with students through chat.
-   Receive rating requests from students.
-   Enable rating for a student.
-   Receive ratings and comments.
-   Purchase a visibility/status package.
-   Receive a VIP, VIP+, or SUPER VIP status.
-   View students who are registered on the platform.
-   Search/filter students.
-   Manage their own profile and availability.

A teacher must **not** be able to:

-   Edit a student's rating after it has been submitted.
-   Delete or modify their own rating.
-   Change the rating value.
-   Remove a review simply because they dislike it.
-   Manipulate the rating system.

------------------------------------------------------------------------

## 3.2 Student

A student can:

-   Register an account.
-   Create a student profile.
-   Add their name.
-   Add a profile picture.
-   Add a username.
-   Write a bio.
-   Select subjects they want to learn.
-   Discover teachers.
-   Search for teachers.
-   Filter teachers.
-   View teacher profiles.
-   View teacher experience and qualifications.
-   View teacher availability.
-   View teacher rating and reviews.
-   Start a conversation with a teacher.
-   Request a rating from a teacher after an interaction/lesson.
-   Submit a rating when the teacher has enabled rating for them.
-   Leave a written comment with their rating.
-   View registered students where appropriate.

A student must **not** be able to:

-   Rate a teacher before the teacher enables rating.
-   Change a submitted rating.
-   Submit unlimited ratings for the same rating request.
-   Rate a teacher without an eligible rating request.

------------------------------------------------------------------------

# 4. Authentication and Registration

Users register as one of two roles:

-   Teacher
-   Student

During registration, the user selects their account type.

The role should be stored as part of the user account and should control
the dashboard experience and available actions.

## Required Account Information

Every user should have:

-   Username
-   Full name
-   Email
-   Password
-   Role
-   Profile picture
-   Created date
-   Updated date

Additional profile information depends on the role.

------------------------------------------------------------------------

# 5. Teacher Profile

A teacher profile should work as a professional public profile.

## Basic Information

-   Profile picture
-   Full name
-   Username
-   Bio
-   Subjects
-   Experience
-   Rating
-   Number of reviews
-   VIP status
-   Availability

## Professional Information

Teachers should be able to provide:

### Experience

Examples:

-   Years of teaching experience
-   Previous teaching positions
-   Relevant work experience

### Education

-   University
-   Degree
-   Field of study
-   Graduation year

### Certificates

Teachers can add:

-   Certificate name
-   Issuing organization
-   Issue date
-   Expiration date if applicable
-   Certificate document/image

### Licenses

Where applicable:

-   License name
-   License number or identifier where appropriate
-   Issuing organization
-   Issue date
-   Expiration date
-   License document/image

### Other Qualifications

Teachers may add other relevant qualifications.

------------------------------------------------------------------------

# 6. Cloudinary

Cloudinary should be used for user-uploaded media.

Potential uploaded files include:

-   Profile pictures
-   Certificates
-   Licenses
-   Other teacher qualification documents

The application should store Cloudinary references/URLs rather than
storing uploaded files directly in the application database.

The system should validate:

-   Allowed file types
-   Maximum file size
-   Image dimensions where appropriate
-   Upload ownership
-   Access permissions for private documents

Sensitive qualification documents should not automatically be publicly
accessible simply because their URL exists.

------------------------------------------------------------------------

# 7. Teacher Availability

Teachers need an availability calendar.

The teacher should be able to define:

-   Available days
-   Available time ranges
-   Unavailable days
-   Unavailable time ranges
-   Recurring weekly availability
-   One-time exceptions

Example:

``` text
Monday
09:00 - 13:00 Available
13:00 - 15:00 Unavailable
15:00 - 18:00 Available

Tuesday
Unavailable
```

The system should distinguish between:

-   Regular weekly availability
-   Specific date exceptions

This will allow future booking functionality without redesigning the
availability system.

The student's timezone and teacher's timezone should be considered when
displaying availability.

------------------------------------------------------------------------

# 8. Teacher Rating and Review System

Ratings are one of the most important trust features of the platform.

## Initial State

Every teacher starts with:

``` text
Rating: 0
Reviews: 0
```

A teacher with no ratings should clearly appear as:

> No ratings yet

rather than displaying a misleading score.

## Rating Request Flow

The rating flow should work as follows:

1.  Student and teacher communicate/interact.
2.  The student requests permission to rate the teacher.
3.  The teacher receives the rating request.
4.  The teacher explicitly enables rating for that student.
5.  The student can now submit a rating.
6.  The student selects a rating value.
7.  The student can optionally write a comment.
8.  The rating becomes permanent.

Example:

``` text
Student
   |
   | Request rating
   v
Teacher
   |
   | Enable rating
   v
Student
   |
   | Submit rating + comment
   v
Teacher profile
```

## Rating Rules

Once a rating has been submitted:

-   The student cannot edit it.
-   The student cannot change the rating value.
-   The teacher cannot edit it.
-   The teacher cannot delete it.
-   The teacher cannot change the rating.
-   The teacher cannot disable an already submitted rating.
-   The same rating request cannot be used more than once.

The platform should keep an immutable record of the rating.

## Rating Value

Recommended initial system:

``` text
1 - Very poor
2 - Poor
3 - Average
4 - Good
5 - Excellent
```

The teacher's displayed rating should be calculated from submitted
ratings.

Example:

``` text
Teacher Rating: 4.7
Reviews: 28
```

## Important Recommendation

Do not allow a teacher to manually approve individual reviews after
seeing the review text.

The teacher should only control whether a specific student is allowed to
submit a rating.

This reduces the possibility of teachers selectively approving only
positive reviews.

## Rating Request Expiration

Recommended rule:

A rating request should expire after a configurable period, for example
7 or 14 days.

This prevents old requests from remaining active indefinitely.

------------------------------------------------------------------------

# 9. Student Profile

Every student should have a profile.

## Required Student Information

-   Profile picture
-   Name
-   Username
-   Bio
-   Subjects they want to learn

## Learning Subjects

Students can select multiple subjects.

Example:

``` text
Mathematics
English
Physics
JavaScript
React
```

Subjects should preferably come from a controlled subject catalog rather
than unrestricted text.

This makes search and filtering much more reliable.

------------------------------------------------------------------------

# 10. Dashboard

The dashboard experience depends on the user's role.

## Teacher Dashboard

Teachers should see:

-   Registered students
-   Student search
-   Student filters
-   Student profiles
-   Rating requests
-   Rating activity
-   Chat conversations
-   Availability management
-   Profile management
-   VIP status
-   Account settings

## Student Dashboard

Students should see:

-   Teacher directory
-   Teacher search
-   Teacher filters
-   Teacher profiles
-   Teacher availability
-   Teacher ratings/reviews
-   VIP status
-   Chat conversations
-   Their own profile
-   Their learning subjects

------------------------------------------------------------------------

# 11. Teacher Discovery

The teacher directory is one of the core parts of the product.

Students should be able to discover teachers using:

-   Subject
-   Experience
-   Rating
-   Availability
-   VIP status
-   Location if the product later supports location-based lessons
-   Language
-   Price if lessons are monetized in the future
-   Online/in-person availability if supported later

## Search

Students should be able to search by:

-   Teacher name
-   Username
-   Subject
-   Relevant profile information

## Teacher Card

A teacher card could display:

``` text
[Profile Picture]

John Smith
@johnsmith

Mathematics
Physics

★★★★★ 4.8
127 reviews

10+ years experience

Available today

SUPER VIP

[View Profile]
[Message]
```

------------------------------------------------------------------------

# 12. Student Discovery

Teachers should also be able to discover students.

The student directory can display:

``` text
[Profile Picture]

Anna Smith
@annasmith

I want to improve my mathematics skills.

Learning:
Mathematics
Physics

[View Profile]
[Message]
```

Teachers should be able to filter students by:

-   Subject
-   Learning goals
-   Availability
-   Language
-   Online/in-person preference if supported later

------------------------------------------------------------------------

# 13. VIP Status System

Teachers can purchase additional visibility.

The initial status levels are:

``` text
Normal
VIP
VIP+
SUPER VIP
```

The purpose of these statuses is to increase teacher visibility in the
teacher directory.

## Suggested Ranking Behavior

Teachers with paid status can receive increased placement in discovery.

A possible priority order is:

``` text
SUPER VIP
VIP+
VIP
Normal
```

Within the same status level, teachers should still be sorted using
neutral product rules such as:

-   Profile completeness
-   Availability
-   Rating/review count
-   Recent activity

The exact ranking algorithm should be configurable.

## Important Product Rule

VIP status should increase visibility, but it should not artificially
change the teacher's rating.

For example:

``` text
SUPER VIP
Rating: 3.9
```

must remain 3.9.

The VIP status and rating are separate concepts.

## VIP Status Expiration

Paid status should have:

-   Start date
-   Expiration date
-   Current status
-   Purchase history

After expiration, the teacher automatically returns to the
previous/default visibility level.

------------------------------------------------------------------------

# 14. Chat System

Students and teachers should be able to communicate through an internal
chat.

## Basic Features

-   One-to-one conversations
-   Text messages
-   Message timestamps
-   Read/unread status
-   Conversation list
-   Last message preview
-   Online/offline status if supported
-   Notifications

## Recommended Future Features

The architecture should leave room for:

-   File sharing
-   Images
-   Voice messages
-   Lesson links
-   Booking requests
-   System messages
-   Block/report functionality

## Chat Access

A student should be able to start a conversation from a teacher profile.

A teacher should be able to start a conversation from a student profile
where permitted.

------------------------------------------------------------------------

# 15. Notifications

The platform should have a notification system.

Potential notifications:

### Teacher

-   New student message
-   New rating request
-   Rating enabled confirmation
-   New student rating
-   VIP status purchased
-   VIP status expiring
-   Profile verification result
-   Availability-related notifications

### Student

-   New teacher message
-   Teacher enabled rating
-   Teacher response
-   New relevant teacher recommendations
-   Booking-related notifications in the future

Notifications should eventually support:

-   In-app notifications
-   Email notifications
-   Push notifications

------------------------------------------------------------------------

# 16. Search and Filtering

Filtering should be a major part of the dashboard.

## Teacher Filters

Recommended filters:

-   Subject
-   Rating
-   Experience
-   Availability
-   Language
-   VIP status
-   Online/in-person
-   Price in future

## Student Filters

Recommended filters:

-   Subject
-   Learning goal
-   Availability
-   Language
-   Online/in-person

Filters should be combinable.

Example:

``` text
Subject: Mathematics
Rating: 4+
Experience: 5+ years
Availability: Today
Language: English
```

------------------------------------------------------------------------

# 17. Subject System

Subjects should be managed centrally.

Instead of allowing every user to create arbitrary subjects, the
platform should have a subject catalog.

Example:

``` text
Languages
  English
  Spanish
  German

Programming
  JavaScript
  TypeScript
  React
  Python

Science
  Mathematics
  Physics
  Chemistry
```

The system should support categories and subcategories.

This will improve:

-   Search
-   Filtering
-   Teacher matching
-   Student matching
-   Analytics
-   Future recommendations

------------------------------------------------------------------------

# 18. Teacher Verification

Because teacher qualifications are an important part of trust, the
platform should eventually support verification.

Possible verification states:

``` text
Not verified
Pending verification
Verified
Rejected
```

Verification can apply to:

-   Identity
-   Certificate
-   License
-   Professional qualification

A verified teacher could receive a visible verification badge.

Important:

Verification should be separate from VIP status.

VIP means paid visibility.

Verified means the platform has verified specific information.

------------------------------------------------------------------------

# 19. Recommended Trust Features

The platform should consider adding:

## Profile Completeness

Show teachers how complete their profile is.

Example:

``` text
Profile completeness: 85%
```

Encourage users to add:

-   Bio
-   Subjects
-   Experience
-   Education
-   Certificates
-   Availability
-   Profile picture

## Report User

Students and teachers should be able to report inappropriate behavior.

Possible reasons:

-   Spam
-   Harassment
-   Fake profile
-   Fraud
-   Inappropriate content
-   Other

## Block User

Users should be able to block another user.

A blocked user should not be able to start new conversations with the
blocker.

------------------------------------------------------------------------

# 20. Admin System

An admin dashboard will eventually be necessary.

Admins should be able to:

-   View users
-   Search users
-   Suspend users
-   Delete users where appropriate
-   Manage subjects
-   Review reported users
-   Review teacher verification requests
-   Manage VIP packages
-   Manage platform settings
-   Review rating abuse reports
-   View platform analytics

Admins should have different permission levels if the platform grows.

------------------------------------------------------------------------

# 21. Data Model - High Level

The exact database schema can evolve, but the main entities should be
separated logically.

## User

``` text
User
- id
- email
- username
- fullName
- passwordHash
- role
- profileImage
- createdAt
- updatedAt
```

## TeacherProfile

``` text
TeacherProfile
- userId
- bio
- subjects
- experience
- education
- certificates
- licenses
- availability
- ratingAverage
- ratingCount
- verificationStatus
- vipStatus
```

## StudentProfile

``` text
StudentProfile
- userId
- bio
- learningSubjects
- availability
- createdAt
- updatedAt
```

## RatingRequest

``` text
RatingRequest
- id
- teacherId
- studentId
- status
- createdAt
- enabledAt
- expiresAt
- completedAt
```

Possible statuses:

``` text
PENDING
ENABLED
COMPLETED
EXPIRED
CANCELLED
```

## Rating

``` text
Rating
- id
- teacherId
- studentId
- ratingRequestId
- score
- comment
- createdAt
```

A rating should reference the rating request that authorized it.

## Conversation

``` text
Conversation
- id
- participantIds
- createdAt
- updatedAt
```

## Message

``` text
Message
- id
- conversationId
- senderId
- content
- readAt
- createdAt
```

## VIPSubscription

``` text
VIPSubscription
- id
- teacherId
- plan
- startedAt
- expiresAt
- status
- paymentReference
- createdAt
```

------------------------------------------------------------------------

# 22. Frontend Requirements

The frontend should use:

-   React
-   TypeScript
-   shadcn/ui
-   Tailwind CSS

The UI should be clean, responsive, accessible, and consistent.

shadcn/ui should be used for common interface components such as:

-   Buttons
-   Dialogs
-   Dropdowns
-   Selects
-   Inputs
-   Forms
-   Cards
-   Tabs
-   Tables
-   Tooltips
-   Toasts
-   Calendar
-   Command/search interfaces
-   Pagination
-   Sheet/drawer
-   Avatar
-   Badge

Do not build a separate visual component system when a suitable
shadcn/ui component already exists.

------------------------------------------------------------------------

# 23. Important UX Principles

## Simple Discovery

A student should be able to:

``` text
Open dashboard
    ↓
Choose subject
    ↓
Apply filters
    ↓
Compare teachers
    ↓
Open teacher profile
    ↓
Check availability + rating
    ↓
Start chat
```

The path from discovery to communication should be short.

## Trust Before Contact

A teacher profile should clearly show:

-   Who the teacher is
-   What they teach
-   Their experience
-   Their qualifications
-   Their availability
-   Their rating
-   Their reviews
-   Whether they are verified

## Mobile Friendly

The platform should work well on:

-   Desktop
-   Tablet
-   Mobile

Teacher cards, filters, chat, calendars, and profiles should be
responsive.

------------------------------------------------------------------------

# 24. Important Business Rules

1.  A user has exactly one primary role: teacher or student.
2.  A teacher starts with zero ratings.
3.  A rating can only be submitted after the teacher enables a rating
    request.
4.  A submitted rating is immutable.
5.  A teacher cannot modify or remove a submitted rating.
6.  A student cannot modify a submitted rating.
7.  A rating request should only be usable once.
8.  VIP status does not modify rating values.
9.  VIP status affects visibility/ordering, not teacher quality.
10. Verification status is independent of VIP status.
11. Expired VIP subscriptions automatically lose their active VIP
    ranking.
12. Users can only edit their own profile.
13. Private uploaded documents must have controlled access.
14. Subject selection should use the platform's subject catalog.
15. Chat conversations must only be accessible to their participants.
16. Admin actions should be logged where appropriate.

------------------------------------------------------------------------

# 25. Recommended MVP

The first version should not try to implement every possible feature.

## MVP Phase 1

### Authentication

-   Register
-   Login
-   Logout
-   Teacher/student roles

### Profiles

-   Teacher profile
-   Student profile
-   Profile pictures
-   Bio
-   Subjects
-   Experience
-   Certificates
-   Licenses

### Teacher Discovery

-   Teacher list
-   Search
-   Filters
-   Teacher profile page

### Availability

-   Teacher availability calendar
-   Available/unavailable periods

### Rating

-   Rating request
-   Teacher approval
-   Student rating
-   Student comment
-   Immutable rating

### Chat

-   One-to-one chat
-   Message history
-   Read status

### VIP

-   VIP
-   VIP+
-   SUPER VIP
-   Basic ranking/visibility system

### Cloudinary

-   Profile image upload
-   Qualification document upload

------------------------------------------------------------------------

# 26. Future Features

The architecture should leave room for:

## Booking

Students can book available time slots.

## Payments

Students can pay teachers through the platform.

## Lesson Management

Teachers can manage:

-   Upcoming lessons
-   Completed lessons
-   Cancelled lessons

## Video Lessons

Integration with:

-   Zoom
-   Google Meet
-   Native video calls

## Teacher Pricing

Teachers can define:

-   Price per hour
-   Price per lesson
-   Package prices

## Matching

Automatically recommend teachers based on:

-   Student subjects
-   Teacher subjects
-   Availability
-   Language
-   Experience
-   Student preferences

## Favorites

Students can save favorite teachers.

## Saved Searches

Students can save filter combinations.

## Reviews and Moderation

Add automated and manual review abuse detection.

## Analytics

Teachers can see:

-   Profile views
-   Student contacts
-   Rating statistics
-   Conversion from profile view to chat

Admins can see:

-   New users
-   Active users
-   Teacher/student ratio
-   Most popular subjects
-   Most active teachers
-   VIP sales
-   Chat activity

------------------------------------------------------------------------

# 27. Product Success Metrics

Important product metrics should include:

## Acquisition

-   Number of registered students
-   Number of registered teachers
-   Teacher/student registration ratio

## Engagement

-   Daily active users
-   Weekly active users
-   Teacher profile views
-   Student profile views
-   Conversations started
-   Messages sent

## Marketplace Health

-   Students who contact at least one teacher
-   Teachers receiving student messages
-   Average number of teachers viewed per student
-   Average number of conversations per active student

## Trust

-   Percentage of teachers with ratings
-   Average rating count per teacher
-   Rating request completion rate
-   Verified teacher percentage
-   Report rate

## Monetization

-   VIP purchases
-   VIP conversion rate
-   Revenue per VIP plan
-   VIP renewal rate

------------------------------------------------------------------------

# 28. Recommended Product Improvements

The following additions would make the platform stronger without
changing its core idea.

## 28.1 Verification Badge

Teacher qualifications are important, so verified certificates/licenses
should have a visible badge.

Example:

``` text
✓ Identity verified
✓ Certificate verified
✓ License verified
```

This gives students more context than simply showing uploaded documents.

## 28.2 Profile Completion

Encourage teachers to complete their profile before appearing
prominently in search.

A complete profile creates more useful information for students.

## 28.3 Availability Preview

Instead of forcing students to open the full calendar, show a simple
summary on the teacher card:

``` text
Available today
Next available: Today 18:00
```

## 28.4 Favorite Teachers

Students should be able to save teachers they like.

## 28.5 Recently Viewed Teachers

Students can quickly return to teachers they previously viewed.

## 28.6 Teacher Response Rate

Show useful communication information:

``` text
Response rate: 96%
Usually responds within 1 hour
```

Only show this after enough message history exists to make the statistic
meaningful.

## 28.7 Teacher Online Status

If technically feasible, show:

``` text
Online
Last active 15 min ago
```

This can improve the chat experience.

------------------------------------------------------------------------

# 29. Product Architecture Principle

The system should be designed as a marketplace rather than simply a
directory.

The long-term product loop is:

``` text
Student
   ↓
Discover teacher
   ↓
Compare profiles
   ↓
Check trust + availability
   ↓
Start conversation
   ↓
Lesson / interaction
   ↓
Rating request
   ↓
Teacher enables rating
   ↓
Student submits rating
   ↓
Teacher reputation improves
   ↓
More students discover teacher
```

This creates a natural reputation loop.

------------------------------------------------------------------------

# 30. Core Product Philosophy

The platform should optimize for three things:

### Discovery

Students should quickly find relevant teachers.

### Trust

Students should have enough reliable information to understand who they
are contacting.

### Communication

Once a student finds a suitable teacher, starting a conversation should
be easy.

VIP status should improve visibility, but the platform should maintain a
clear distinction between **paid visibility**, **verification**, and
**student reputation**.

The core product is not the VIP system or the chat system.

The core product is:

> **Helping the right student find the right teacher and giving both
> sides a trusted way to connect.**
