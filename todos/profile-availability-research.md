# Profile and availability research

Research date: 2026-10-10

Scope: first-party product documentation and APIs only. “Verified” below means
the linked source explicitly documents the behavior. “Recommendation” is an
implementation conclusion for FindMyTutor, not a claim about the vendor.

## Findings

### Profile photos

- **Verified — Google Accounts:** a Google account can have a profile picture;
  users can add or change it, and other Google users may see the name and
  profile picture. If no picture exists, Google shows initials. The help page
  also documents cropping during upload.
  Source: [Google Account Help — Change your Google Account picture](https://support.google.com/accounts/answer/27442?hl=en)
- **Recommendation:** store an avatar as a separate profile asset, retain a
  stable object identifier and metadata rather than trusting a remote image
  URL, validate MIME type/size/dimensions, generate a square thumbnail, and
  provide replacement/removal. Keep qualification documents separate from the
  public avatar and protect their delivery.
  Basis: [Google Account Help — Change your Google Account picture](https://support.google.com/accounts/answer/27442?hl=en)
  documents the account-picture lifecycle; the asset and document-separation
  details are FindMyTutor implementation recommendations.

- **Gap:** the accessible official [Preply Help Center](https://help.preply.com/en/),
  [Wyzant Help Center](https://support.wyzant.com/hc/en-us), and
  [TutorCruncher Help Center](https://help.tutorcruncher.com/) help
  centers did not expose stable article content for profile-photo rules during
  this research. This is a research limitation, not a product-behavior claim;
  do not infer their exact crop, moderation, or visibility policy from
  third-party guides.

### Multiple subjects / skills

- **Verified — Microsoft Bookings:** a booking business has a collection of
  services. A service has a display name, description, duration, pricing,
  visibility, and `staffMemberIds`, which identifies the staff who provide that
  service. This is an official first-party model for offering multiple
  separately bookable specialties and associating providers with each.
  Source: [Microsoft Graph — bookingService resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
- **Verified — Microsoft Bookings:** staff members expose a display name and
  working hours, while services are separate resources. The API therefore
  separates “who the provider is/when they work” from “what service is being
  booked.”
  Source: [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0)
- **Recommendation:** model subjects/skills as normalized records with an
  explicit teacher-to-subject relation (optionally level, years of experience,
  verification, and display order). Do not put a comma-separated subject
  string in the profile. If subjects can be booked independently, give each
  subject/service its own duration, price, and visibility; otherwise keep
  subject taxonomy separate from booking-service configuration.
  Basis: [Microsoft Graph — bookingService resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
  and [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0)
  separate services from staff, while the normalization and taxonomy choices
  are FindMyTutor recommendations.
- **Gap:** none of the fetched first-party sources, including
  [Microsoft Graph bookingService](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
  and [Microsoft Graph bookingStaffMember](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0),
  documented a tutoring marketplace’s exact taxonomy, ordering, or
  skill-verification workflow.

### Timezone selection and conversion

- **Verified — Microsoft Bookings:** `bookingStaffMember.timeZone` identifies
  the staff member’s time zone; `workingHours` represents their bookable
  ranges. The API can use either business hours or member-specific hours, and
  can additionally check the member’s personal calendar before offering a
  booking.
  Source: [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0)
- **Verified — Microsoft Graph:** a date-time value contains a `dateTime` and
  `timeZone`; supported values include Windows time-zone names and a documented
  list of additional IANA-style names. Microsoft warns that individual APIs
  may not support every listed zone.
  Source: [Microsoft Graph — dateTimeTimeZone resource](https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0)
- **Verified — Google Calendar:** a calendar has a default time zone, and the
  Calendar API event model supports event time zones and recurrence. The
  recurring-event help page is the first-party UI reference for creating
  recurring events.
  Sources: [Google Calendar API — calendars](https://developers.google.com/workspace/calendar/api/v3/reference/calendars),
  [Google Calendar API — events](https://developers.google.com/workspace/calendar/api/v3/reference/events),
  [Google Calendar Help — Create a recurring event](https://support.google.com/calendar/answer/37115?hl=en)
- **Recommendation:** let each user select an IANA time-zone identifier
  (for example, `Asia/Tbilisi`) from a searchable list, save it with the
  availability rule, and never persist only a numeric UTC offset. Store
  instants in UTC; interpret weekly local times in the owner’s zone and
  convert them for the viewer at read time. Recompute future occurrences
  using a DST-aware time-zone library. Show both the viewer’s displayed zone
  and the teacher’s canonical zone when ambiguity matters.
  Basis: [Microsoft Graph — dateTimeTimeZone resource](https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0)
  and [Google Calendar API — events](https://developers.google.com/workspace/calendar/api/v3/reference/events)
  document named time zones on date-time/calendar data; the canonical IANA
  storage, UTC expansion, and display choices are FindMyTutor recommendations.
- **Gap:** [Microsoft Graph — dateTimeTimeZone resource](https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0)
  documents Windows names plus additional IANA-style names, while
  [Google Calendar API — calendars](https://developers.google.com/workspace/calendar/api/v3/reference/calendars)
  uses calendar time-zone identifiers. The application should choose one
  canonical format and define an explicit mapping at integration boundaries;
  this is an implementation recommendation.

### Recurring weekly availability

- **Verified — Microsoft Bookings:** `bookingWorkHours` represents one weekday
  (`sunday` through `saturday`) and contains a collection of start/end
  `timeSlots`; both businesses and staff members can have these hours.
  Source: [Microsoft Graph — bookingWorkHours resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingworkhours?view=graph-rest-1.0)
- **Verified — Microsoft Bookings:** staff availability defaults to business
  hours; setting `useBusinessHours` to false uses the staff member’s
  `workingHours`. Personal-calendar conflicts can further reduce availability.
  Source: [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0)
- **Verified — Google Calendar:** recurring events are represented through the
  Calendar API’s recurrence support, while calendars carry a default time zone.
  This is event recurrence rather than a dedicated “open slots” rule engine.
  Sources: [Google Calendar API — events](https://developers.google.com/workspace/calendar/api/v3/reference/events),
  [Google Calendar API — events and calendars concepts](https://developers.google.com/workspace/calendar/api/concepts/events-calendars)
- **Verified — Calendly API:** Calendly exposes user availability schedules
  through dedicated list/get availability-schedule endpoints, and event types
  are separate resources. The official API documentation is the source of
  truth for integrating schedules rather than scraping the booking page.
  Sources: [Calendly — List User Availability Schedules](https://developer.calendly.com/api-docs/calendly-api/availability/list-user-availability-schedules.md),
  [Calendly — Get User Availability Schedule](https://developer.calendly.com/api-docs/calendly-api/availability/get-user-availability-schedule.md),
  [Calendly — List User’s Event Types](https://developer.calendly.com/api-docs/calendly-api/event-types/list-event-types.md)
- **Recommendation:** represent weekly availability as immutable-ish rules:
  `dayOfWeek`, local `startTime`, local `endTime`, `timeZone`, and enabled
  state; allow multiple non-overlapping slots per day. Validate
  `start < end`, reject overlaps, and keep one-time date exceptions separate
  from the weekly template. Expand only within a requested date range, then
  subtract bookings, blackout dates, and calendar conflicts. Preserve the
  original local rule when a user changes their timezone.
  Basis: [Microsoft Graph — bookingWorkHours resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingworkhours?view=graph-rest-1.0),
  [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0),
  and [Calendly — List User Availability Schedules](https://developer.calendly.com/api-docs/calendly-api/availability/list-user-availability-schedules.md)
  establish weekday/time-slot and schedule-resource primitives; the
  validation, exception, and expansion rules are FindMyTutor recommendations.
- **Gap:** Calendly’s public API documentation confirms schedule resources but
  does not, in the fetched pages, provide the complete UI semantics for
  editing every recurring rule or exception. Confirm exact endpoint payloads
  against the current OpenAPI specification before implementing an integration.
  Sources: [Calendly — List User Availability Schedules](https://developer.calendly.com/api-docs/calendly-api/availability/list-user-availability-schedules.md)
  and [Calendly — Get User Availability Schedule](https://developer.calendly.com/api-docs/calendly-api/availability/get-user-availability-schedule.md).

## Practical synthesis for FindMyTutor

1. Public profile: one optional avatar asset plus a normalized subject list.
   Basis: [Google Account Help — Change your Google Account picture](https://support.google.com/accounts/answer/27442?hl=en)
   and [Microsoft Graph — bookingService resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0);
   this is a FindMyTutor recommendation.
2. Teacher settings: one canonical IANA timezone and recurring weekly local
   slots; permit multiple slots on each weekday. Basis: [Microsoft Graph —
   bookingWorkHours resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingworkhours?view=graph-rest-1.0)
   and [Google Calendar API — events](https://developers.google.com/workspace/calendar/api/v3/reference/events);
   the canonical storage choice is a FindMyTutor recommendation.
3. Booking read model: generate UTC instants for a requested range, convert to
   the viewer’s zone, then subtract bookings and exceptions. Basis: [Microsoft
   Graph — dateTimeTimeZone resource](https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0)
   and [Google Calendar API — events](https://developers.google.com/workspace/calendar/api/v3/reference/events);
   this is a FindMyTutor recommendation.
4. Keep profile subjects, bookable services, and availability as separate
   concepts. A teacher may teach many subjects, while a booking can target one
   subject/service and inherit its duration or price. Basis: [Microsoft Graph
   — bookingService resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
   and [Microsoft Graph — bookingStaffMember resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0);
   this is a FindMyTutor recommendation.
5. Treat photo moderation/cropping and subject taxonomy as product policy
   decisions; the cited sources do not establish tutoring-marketplace
   defaults. Basis: [italki Profile Display Name and Picture Guidelines](https://support.italki.com/hc/en-us/articles/206351988-Profile-Display-Name-and-Picture-Guidelines)
   demonstrates platform-specific photo rules, while [Microsoft Graph —
   bookingService resource](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
   does not define tutoring taxonomy; this is a FindMyTutor policy
   recommendation.

## Gaps and source-quality notes

- [Preply Help Center](https://help.preply.com/en/) and [TutorCruncher Help
  Center](https://help.tutorcruncher.com/) URLs were not reliably resolvable in
  the available fetch environment; [Wyzant Help Center](https://support.wyzant.com/hc/en-us)
  loaded only its shell.
  No vendor-specific behavior is asserted for those products.
- [Google Calendar API](https://developers.google.com/workspace/calendar/api/v3/reference/events)
  and [Microsoft Graph booking resources](https://learn.microsoft.com/en-us/graph/api/resources/bookingservice?view=graph-rest-1.0)
  are authoritative APIs/help documentation, but
  they are scheduling primitives rather than tutoring-marketplace UX specs.
- All recommendations above are design guidance derived from the verified
  [Microsoft Bookings](https://learn.microsoft.com/en-us/graph/api/resources/bookingstaffmember?view=graph-rest-1.0),
  [Google Calendar](https://developers.google.com/workspace/calendar/api/v3/reference/events),
  and [Calendly](https://developer.calendly.com/api-docs/calendly-api/availability/list-user-availability-schedules.md)
  data models; they are not claims that any cited vendor implements them
  exactly.
