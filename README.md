Generate all necessary files and docker run instruction.

# Признавашки - Confession Website Requirements

I want you to make a web app where users can register and send notes to each other.

# Phases
There are two phase in the app. The phase is set via env var in env variable "passive" (phase 1) or "active" (phase 2). There is no admin priviliges, all users are the same, the phase is changed by launching run script with differn env var for "PHASE".

## Phase 1 – registration app.
All user can do – register or login, and be in his personal space.

## Phase 2 – active phase, notes sending
After i trigger the phase two (run app with different env var for phase), each personal account will have a button below "Перейти к галерее". The grid of users will be available and note sending will be possible.

# Screens
## Screen one – login
- register – unique nickname, strong password (password check must be there)
- login – with password and nickname

## Screen two – personal account in phase 1
After logging in, user got into his personal account. It consists of nickname and photo.  Photo can be updated and uploaded if we click on it. Below there is a countdown "до открытия галереи ..."

## Screen two – personal account in phase 2
The big button "Перейти к галерее" in the personal account appear. There is also section "sent notes" and "my mailbox".

## Screen three – The gallery view
If button "Перейти к галерее" is pushed and if stage 2 is activated, user can see a gallery. It is a grid of all registered users. Each cell has photo, nickname and a button "send a note" below. There is a search at the top of the page – search by nickname.
After hitting send note you can enter your note. There is a checkbox – send anonymously. Then the receiver will not see from who it is. However each user has unique anonymous identifier like "anonym_27". This way the receiver can see that messages are from different people. After sending user see pop-up "Ваша записка брошена в ящик." and the count of sent notes is plus 1. User can see al sent notes in personal account in section "sent notes". No editing, just view.
At the top right corner there is a personal account button and a mailbox button (mailbox is a cute picture of mailbox) with unread identifier (5 for 5 new notes). After clicking user is redirectired into personal account / "my maibox", where he can see al sent notes.

# Stack
- docker for building the app
- data is stored in postgres volume
- Frontend should be nice-looking – scrollings, hover animations, etc.
