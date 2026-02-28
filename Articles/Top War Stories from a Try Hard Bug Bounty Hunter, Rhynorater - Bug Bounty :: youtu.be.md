---
url: https://youtu.be/PXqlHAoF2wc?si=75ixW8PF5VYfV3xv
---

# Top War Stories from a Try Hard Bug Bounty Hunter, Rhynorater | Bug Bounty Village, DEF CON 32

*Bug Bounty DEFCON*

<iframe width="560" height="315" src="https://www.youtube.com/embed/PXqlHAoF2wc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Transcript

[0:10](https://youtube.com/watch?v=PXqlHAoF2wc&t=10s)

All righty, y'all. I think we're going to go ahead and get started a little bit early. Uh, sorry for any of the people that are coming in at the last minute, but we'll go ahead and uh get rolling. Also, I realized that I got super lucky because uh this is the last slot of the day, so uh we can go a little bit long, which is exciting. You guys can hear me all right on this one, too, right? I kind of like to walk around a little bit. Okay, saw it. Oh, I need to point it right at it. Okay, so uh for any of you the guys that don't know me, I'm Justin Gardner aka Rhino Raider. I'm a professional live hacking event participant, aka full-time bug bounty, aka no job. And uh I hack web applications mostly and IoT devices uh occasionally and sometimes mobile devices when Joel is here to help me out. Um, I'm the host of the Critical Thinking Bug Bounty podcast with my boy Joel right here as the co-host and I'm also adviser for Kaido. Um, so check those out if you're interested. All right, let's go ahead and talk about the road map for today's talk. Um, we're going to hit 11 bugs and I I don't have

---

[1:12](https://youtube.com/watch?v=PXqlHAoF2wc&t=72s)

to rush which is great. I was going to give you a disclaimer that we're going to move pretty quickly. Um the whole concept behind this talk was to kind of bring to you all the experience that uh the hackers get at a live hacking event during the show and tell portion which is at the end of the event when we all sit down and we compare notes some of the people go up on stage and present the bugs that they've found. So what I've done is I've compiled 11 vulnerabilities for you over the past two or three years of bug bounty hunting all criticals. Um, and I'm gonna walk you through each one, and I'm gonna do so uh at as much technical depth as I can without revealing the target. Um, we have three easy bugs. We have two mediums, four hards, and two very hards. Uh, so we're going to start off easy, and then we're going to go go uh a little bit deeper after that. All right, so let's jump into it. First one is an EngineX 403 bypass to PII leak. Okay, so this is on a semi uh private program. You'll see actually throughout the whole um presentation that we uh that most of the targets that I'm hacking on are public programs or uh our

---

[2:15](https://youtube.com/watch?v=PXqlHAoF2wc&t=135s)

semi-private programs which is essentially a private program that everyone knows exists and they're very public about the fact that they exist and you can easily get added to that program and paid for a bug if you have a bug. Um, so when finding this bug, the first indicator that there might be a bug here was that the application uh or that the the company was taking a piece of software that was meant for internal use and then um they've modified it to be publicly used so anybody can sign up and log into this app, right? So when they do that, of course, the threat model changes for the application, right? Um so I thought that was really sketchy so I decided to look into it a little bit deeper. Um, so what I was thinking is okay well when this app was intended for private use only within an organization then there was probably a lot of implicit trust between the users in the organization you know if I am in in a organization with Joel I it's probably not a huge problem if I can go and look and see his last name or whatever right however in a public application um that information may be more sensitive so I decided to look for those sort of endpoints exploiting uh

---

[3:15](https://youtube.com/watch?v=PXqlHAoF2wc&t=195s)

implicit trust and leak user data so I I identified a couple of those endpoints in the uh sort of internal use version of the software. And when I hit them on the API, I noticed that I got an enginex 403, right? Uh instead of the application level 403. You can see the differences over there. Um the engineext 403 uh seems to imply that there is a uh this sort of structure. Okay. So we're uh on the network, we send a request over the internet to the engineext reverse proxy that's standing in front of the backend server. And then uh the backend server processes that request gives the response back to engineext which gives the response back to the user. Pretty standard enginex structure um or reverse proxy structure. However, when we request the apoint or the API endpoint/ API/ internal/getall users that's not the API endpoint uh that's obuscated. Um it hits the uh reverse proxy and then the reverse proxy says boop not allowed. Right? So I I noticed

---

[4:15](https://youtube.com/watch?v=PXqlHAoF2wc&t=255s)

the difference between those two 403 pages and I thought we should try to fuzz that a little bit. So what do we do? We try uh get all users. We hit the 403. We try get all users with a Z um just to see if they had like blocked off that specific endpoint at the uh EngineX level or whether they uh are blocking out the path before that right um we get a 404 there. though not that whole path is uh uh SL API/ internal is not all blocked just get all users. So then I tried some path traversal stuff and eventually I started encoding various characters and found out that a double URL encoded uh s would pass through the reverse proxy and not be perceived as a match for the block on get all users route and um it would be parsed on the back end as an s. So it would match that get all users route and dump back a ton of data. Um so the impact of that one was 4.5 million users PII leaked. The bounty was between 15 and 20K. I'm going to give you ranges because uh some of

---

[5:18](https://youtube.com/watch?v=PXqlHAoF2wc&t=318s)

the ranges can the actual numbers can disclose the programs. Um the severity was critical critical critical which is what we say from the critical thinking podcast. Shout out to YT Cracker. And uh and this program was se private as mentioned before. The takeaways for this one um were obviously that change to threat model like we mentioned. Identify odd and out ofplace 403 pages. Those can always tell uh can imply to you when a route is getting essentially blocked off by a reverse proxy and might be bypassable via some of these um normalization tricks. And yeah, there was an amazing talk by one of the guys at Port Swagger earlier today on some of the amazing uh path reversal and path normalization stuff you can do. Um, so I bet that would also be really helpful here. Um, so the last takeaway is know your bypass tricks, URL encoding, WRL encoding, pass reversal, etc. All right, let's move to the next one. This one's really easy. It's an arbitrary account takeover via docs essentially. So I open the docs. I look at these endpoints and I notice that there is an API endpoint

---

[6:20](https://youtube.com/watch?v=PXqlHAoF2wc&t=380s)

for uh/ot token and the um there's an authorization header required for that. And the body is really simple. Uh, it's just grant type equals password and then uh username equals user equals username, password equals password. That's exactly what you would expect and it dumps back the access token. Very, very reasonable. But wait a second, a password. This application is a OTP login application. There's no password. You just put in your email. They send you a link to your email. You click on it and you're logged in. So, how does that work? So, I started building it out. And when I sent the request, I got a 401 unauthorized. Of course, uh we need to uh authorize with base with the um uh credentials mentioned in the doc uh for the authorization header. So uh I I went and I needed that. So I was like, what do I do? Of course to the JS files. So I search in the JS files. I'm looking for the applica the um the UI the part of the UI that uses this uh request. and

---

[7:21](https://youtube.com/watch?v=PXqlHAoF2wc&t=441s)

I find sitting in the JS files um these these uh authorization credentials and they're obviously B 64 encoded and the values were kind of odd. I can't show them to you but um they weren't they weren't random. They were just a string. So it was a little bit of an odd setup. Um and so then using those uh authorization basic credentials, we could literally just submit any password for any user and it would accept it um and dump back the authorization token giving us access to arbitrary account takeover on this target. This is a public program. This is a a very high paying public program and this sort of stuff is out there. Um so this was a Thank you. Thank you. This was an uh arbitrary ATO on double-digit million accounts, 40 to 60k bounty. Um, of course, critical and like I mentioned public uh public program. So, takeaways for this will be read the docs, think about the docs, and then uh check the JS uh because there's a lot of good stuff in there. All right, next uh bug number

---

[8:23](https://youtube.com/watch?v=PXqlHAoF2wc&t=503s)

three. This one's very similar to the last one. Uh, essentially you take the O bearer and you log into that API, that godforsaken API and there's simply a numeric IDOR in that API that literally leaks password hashes and password reset tokens. Uh, and I see someone in the audience that is laughing uh because I think they know the target that I'm talking about. Um, so that's interesting. Uh, but yeah, the password reset token is there. you can just password reset the account, hit the ID door, and then uh you'll be able to log into the person's account. This was also 40 to 60K. Uh and the takeaway from this one that's different from the other one is just get really deep into these apps. Um it probably took 40 hours of configuring stuff and getting to know the various parts of the application before I got to this point where I was needing to authenticate into this asset. Um so that's the behind the scenes. I don't want to make sure I want to make sure that it's not perceived as looking uh too easy because there is some work that goes into it. Okay, bug number

---

[9:25](https://youtube.com/watch?v=PXqlHAoF2wc&t=565s)

four. We're moving into the medium uh difficulty section now. This was a blind XSS via SMS to arbitrary account takeover. So, this was on an app that uh was a uh a place where you could buy a car and there was a uh a sister app uh that would allow the dealers to deal with the uh it's kind of like a CRM for the dealers, right? So, you go ahead and find a car. Uh, I was interested in this Delorean for 42 million. Um, and so I went ahead and filled filled it out and somebody named Christina from my local car place reached out to me and said, "Hey, Justin, I saw that you, you know, filled out the request for this. Um, you know, when can we meet to see the car?" I was like, "Okay, wow. How did they do that?" Cuz I had access to the dealer panel as a part of this uh scope and I didn't see where they did that. So I said, "Okay, let me go ahead and log into the dealer software and get that perspective." So this is what I see. You can select the um the users that you want to view the the details for on the lefth hand side. And there's like an info and a financing tab and you can kind of inspect that that lead that had

---

[10:27](https://youtube.com/watch?v=PXqlHAoF2wc&t=627s)

come through the uh the website. And so I started reading the code on that page and there's like some super long window object that's kind of difficult to read, but if you scroll through it and do your due diligence, there's a section called feature flags. um which is something that I just talked about at my talk earlier in Bug Bounty Village. Uh and there was a messages feature flag. So we turned that from false to true. Uh and you can see uh yeah from false to true with this uh easy Kaido match and replace rule. And voila, the messages tab appears in the application and we have the ability to use it. So uh as we as we go into that application, we can send messages to the various leads. It'll go to the phone number that they submitted. Um, and then you can interact with them. Great. Um, so I sent myself a message. I submitted a lead, sent myself a message, and I thought, okay, wow, wouldn't it be cool if I could SMS myself a uh an XSS payload. So I went ahead and first typo my XSS payload to something that would never work. Uh, proceeded to reaction

---

[11:29](https://youtube.com/watch?v=PXqlHAoF2wc&t=689s)

down it instinctually, and then submitted the actual uh, XSS payload. when the dealer came back to this screen, they would see that the XSS would pop and uh we were able to get a blind XSS of sorts in this environment. Um so we've got blind XSS, but what can we do with it to get more impact? Well, um the authorization flow for this application happened in an invisible iframe right uh near this interface. And what it would do was is it would go through the ooth flow on a different domain and then it would call back with just a token. Um, and so what I did using the XSS is I I uh cookie bombed that callback location and then so that the code wouldn't get consumed and then I stole the code out of the iframe and exfiltrated that to the attacker server. So whenever the dealer comes their session token would be excfiltrated, the attack the victim the victim's token would be exfiltrated and the attacker can simply click the link and they're logged into the victim's dealer account.

---

[12:31](https://youtube.com/watch?v=PXqlHAoF2wc&t=751s)

And you don't have to bypass MFA or anything like that because uh the session token is there. Great. So now we've got uh we can log in as the dealer. We've got atto. How can we get even more impact? Well, that same request uh had three vulnerabilities in it. Okay. The uh send SMS message API endpoint had a dealer ID that was vulnerable to Idor, a client ID that was vulnerable to IDOR, and the message was vulnerable to XSS. So essentially what this means is that we can worm this XSS across all of the dealers. We can send a message to every client from every dealer with an XSS payload and then proceed to hijack their accounts. And when we get access to their accounts, then we get access to all of the PII of all of the customers that have ever used this application. Uh so that was bad. Um and that was an arbitrary ATO and uh of double digit million uh users PII leak 20 to 40K. This was on a private

---

[13:33](https://youtube.com/watch?v=PXqlHAoF2wc&t=813s)

program. However, this program will be going public soon, I'm aware. And uh the takeaway for this is look at all the look at the application from all perspectives, right? We wouldn't have seen this if we just looked at it from the dealer perspective or just looked at it from the client perspective. Make sure you're turning on all the feature flags with match and replace that can enable features that um are essential and uh look for alternative data input paths like SMS. Uh and then lastly, of course, chain chain chain to get maximum impact. Okay. Um bug number five, uh snoop on other people's meetings. This was a really interesting one. It's going to be a little brief, but um there was a target that I came across in a video chat and team collaboration app. And for this specific um period, I decided to focus on a specific goal, which was I wanted to be able to do creepy with in people's meetings, right? Um so I I started investigating how exactly that worked. I read the developers docs, the JavaScript code, the GitHub issues,

---

[14:34](https://youtube.com/watch?v=PXqlHAoF2wc&t=874s)

everything. And um when I was investigating the GitHub issues, this GitHub issue popped up. It says the participant list is wrong when XYZ audio device is used. And I was like, huh, that's weird. So, the participant list didn't get updated when the user has a broken audio device. Why would that be happening? So, I I I thought maybe I can make that happen and uh that would be I would be able to enter meetings without people knowing I was there. So, um how does that how does this joining meeting work? The user connects first over WebRTC. Then they get all of the uh information like the call, comms, channels, etc. And then the JS code identifies an audio device uh that the user can use or it creates a fake audio device and then the client side.js sends the audio connect signal to join. Wait, what? It sends an audio connect signal to join. that little that you hear when you join a meeting was the thing actually triggering the

---

[15:35](https://youtube.com/watch?v=PXqlHAoF2wc&t=935s)

participant list update which I really could not believe and so since this was happening on the client side we could just not send the signal and that's exactly what we did with this match and replace rule um we just simply said has did a true false switch on whether the audio signal had already been sent or not and it didn't send the signal and we became Snoop Dogg in that environment Okay, so let's see how it worked. Here's my Snoop Dog PC right here. That's what I named it. The triggers loved it. Um, and essentially what you would do, uh, is paste in the meeting information and then you would click snoop and, uh, it would actually exfiltrate the, uh, users transcripts, and you would not see anything in the in the meeting participant list. Um, so that one, uh, was a 20 to 25k bounty. It was technically high, but it was paid as a critical uh given the the various bonuses that were occurring. This is on a public program as well. So, takeaways

---

[16:35](https://youtube.com/watch?v=PXqlHAoF2wc&t=995s)

from this one, rating the GitHub issues can have massive dividends, especially anything related to security or privacy. Um, set goals for your target like being able to snoop on meetings and then uh verify in the code base how this works, especially on the client side. Okay. Uh, we are 15 minutes in. Dude, we are doing good. I may I may not keep you here long. We'll see though because now things are getting a little bit trickier. Okay, so this one's going to be a long one. Um, this one was uh a Perforce server to uh client rce and I'll explain what that is in just a second. The target for this was a desktop application used for game development. Okay, the problem is I suck at hacking desktop applications. Note that I did not add that in the list of things that I often hack in the intro slide. Um, so I was thinking, all right, how can I attack this? This is kind of a little bit outside of my comfort zone. Um, I can't really do privilege escalation stuff because this doesn't really run in a privileged environment. So I was thinking, okay, but local attacks are kind of dumb anyway. Uh, let

---

[17:37](https://youtube.com/watch?v=PXqlHAoF2wc&t=1057s)

me try to focus on remote attacks. And these are some of the ideas that I came up with. I just want to walk you through the process so all of this doesn't seem too easy. And you see how often we fail when attacking targets like this. So here are some of the attack vectors I came up with. I was thinking we could open a malicious file in the the development thing and something bad would happen. We could connect to a malicious server with the development environment and then something bad would happen. We could attack the uh software development life cycle all loopin alla Ronnie Carta right here. Um and try to inject something into the build of this application itself. um we could uh sort we could take advantage of some sort of misconfiguration uh in the actual code itself like maybe it's reaching out to an unclaimed domain or an unclaimed S3 bucket and inject sort of there or we could kind of take these um reusable game component pieces that were being processed and try to do something with those. So I started going down these paths and uh I I checked out open a malicious file. So I broke apart

---

[18:39](https://youtube.com/watch?v=PXqlHAoF2wc&t=1119s)

some of the file file um some of the file extensions associated with this and looked at the structure. I was replacing paths with like UNCC paths to see if I could force it to reach out to a remote server. Um I found that you could include settings for a project in a file. That was kind of interesting but couldn't really do anything with with malicious with it at the time. Um I noticed that there was a lots of XML so I started you know spraying around various XXE payloads in there and seeing if they would trigger. No luck. symbolic links. I was kind of playing around with those and nothing's really working. Kind of meh, feeling kind of insufficient at this point to look at this target. So, I uh move along to the next attack vector. So, that was uh connect to a malicious server. So, what do I mean by that? Um this this software had the ability to connect to remote version control um servers so that you could store your code that you were developing in a uh a remote version control. Um, and there were multiple types. Uh, and Perforce was one of those types. Uh, and that was

---

[19:41](https://youtube.com/watch?v=PXqlHAoF2wc&t=1181s)

something that I hadn't really heard of before. And I know from a lot of the work of like, uh, Alex Chapman and some of the other great Git uh, version control hackers out there that version control can be hella sketchy. Um, and so I kind of went down this route. Um, so I started looking up uh the Perforce protocol spec and I found this awesome article that told me about that. Funny side note that I don't have in the slides. Uh, the guy I just mentioned, Alex Chapman, he was also uh, working on this target at the same time and he actually had a public blog on how to exploit this specific protocol that I didn't find a little bit until a little bit later and then I realized, oh he's going to find that same bug. Um, and we did have a bug collision, but it still worked out great. So, anyway, I clicked on this article and uh, and it was a really great article describing how this protocol works. Um, it broke down the RPC structure. It's a binary protocol, which I was a little bit

---

[20:41](https://youtube.com/watch?v=PXqlHAoF2wc&t=1241s)

uncomfortable with as a web guy. Um, but I decided to try to continue working on it. And as I was I was reading through the article, I see this very convenient uh, file synchronization uh, flow on the right hand side there. Now, if you read that for a second, you'll see something a little bit odd, right? the server says client open file client write file and I was like hm that seems odd that the server can just say write files but it is a version control system I wonder if there's any like path reversals or something nasty that I can do with that. So, I on a hunch I started developing uh this malicious Perforce server. And this was I'm not gonna lie to you guys. This was really intimidating to me because I'm a web guy, like I said, and I don't really deal a lot with binary protocols. But I thought now is is probably the best chance I'll ever get because this article literally breaks everything out as clean as can possibly be. So, I decided to go down that that path. And in the end, the code was actually really simple. uh I would just created a function that would pass in a a JSON

---

[21:42](https://youtube.com/watch?v=PXqlHAoF2wc&t=1302s)

blob and those names and values would then be encoded into the binary format that was described in the article which was essentially uh the parameter name a null bite the value length um and then the actual value itself and then a null bite and then that would be sort of packed into a bigger um sort of call uh that would pass through the the socket. Okay. So, uh, man, working with, uh, strct.pack was really scary to me. Whenever I saw those exploits where it's like, all right, less than and B and and I and H, uh, I I was thinking like, wow, this is really complicated. But, um, one, chat GBT is really helpful for that nowadays. Uh, and and two, um, you just kind of put your head down and keep working at it, I think it it comes pretty quickly. So, we I was able to build the whole exploit and essentially this is a funny part that I wanted to highlight for you guys. Um, when the client connects, of course, it's going to try to O, right? And my server was just like, yes, yes, you you've off

---

[22:44](https://youtube.com/watch?v=PXqlHAoF2wc&t=1364s)

correctly. Let's go. Um, and just ignored the whole O part. Uh, which was really funny. And then just said, write a file. And essentially what it would do is write a file to anywhere on the file system via path traversal. And, uh, so how do we convert that to rce? Well, it was really easy. There was an exe file that was getting run every 2 seconds. So you just uh take your malicious .exe file, overwrite that file, and then it gets run 2 seconds later and you pop a shell. Um, and yeah, how do we actually make this a plausible attack? Well, um, as I mentioned earlier, there was the ability to include malicious settings for the project. Uh and one of those settings which was not not super present in the documentation uh was the ability to provide a uh version control server to connect to and it would when it opened the file it would automatically connect to that server. So I could provide a victim with a file. They'd open it connect to my server. My server would push a file down and shell the the

---

[23:44](https://youtube.com/watch?v=PXqlHAoF2wc&t=1424s)

device. Um so that was an RC via malicious file. Um and the bounty for that was 15 to 30k. uh critical critical critical of course and that was again on a public program. Takeaways from this read the freaking docs it really helps and articles uh don't shy away from targets you're scared of and use uh your super amazing hacker brain for any struck pack calls uh or chat whichever you're more comfortable with. Okay, Joel, I've got some uh I've got some Easter eggs for you in this one, man. You're gonna like this. Okay, so um the next bug that I wanted to talk about was showing a public program router. Um, once again, uh, I wasn't super familiar with IoT devices before this and so, uh, I leaned heavily on my boy Joel Margolus, my podcast co-host here. And as cute as we are together there in that picture, we are both independently married. Um, although that would be great. Um, um, so let's get let's get to the details, okay guys? Um, essentially what

---

[24:47](https://youtube.com/watch?v=PXqlHAoF2wc&t=1487s)

we did is we took this router that was in a public program. We broke it apart and we used the FCC website in Google in our brain to identify that this chip was in, this is what it sounded like to me the first time, a BGA emmc1234 uh G74XYZ. This is coming out of Joel's mouth. And I was like, "Oh my gosh, what the heck is that?" Well, it's a lot easier uh than you would think. It's a ball grid array. Those are those little um little pieces of uh silver pieces there, the little pieces of solder, the connections. And then this is an eMMC which is essentially a SD card which is just attached to the the firmware device uh or attached to the the board. So that was really cool. So we wanted to get that chip off. So uh and for some reason uh Joel let me do it. So uh what what we did was we get a hot air I ordered a bunch of stuff on Amazon. I got the hot air rework station and lots of flux and I sat down on the device and started blasting it with uh 500 degrees Fahrenheit air and Joel was like, "Don't

---

[25:47](https://youtube.com/watch?v=PXqlHAoF2wc&t=1547s)

do that, bro." And then I proceeded to pull the MMC chip off before the solder was completely uh liquid and Joel was like, "Don't do that." And just give it some time. And then finally, after bricking three of them, uh we were we were actually able to get a clean read of the eMMC chip in our BJ reader and pull off the uh the firmware for that device. Um here's Joel's super awesome hardware hacking setup, by the way, which I'm jealous of. Um yeah, bricked three of them. Not a great feeling, but the company paid for it, so that was great. Um so now we've got the firmware, so we can start hunting reliably, and it's time to shell that. So what that what we did then we were hoping it was going to be a lot easier than it was but it was several days of weeding through uh Python code to find the actual attack vector that we ended up getting our C with. Um, and so the attack chain started that we ended up going with started with uh us using an HTTP request to the cloud provider for this specific device uh that sent a certificate up and

---

[26:50](https://youtube.com/watch?v=PXqlHAoF2wc&t=1610s)

that certificate was then pushed to the device and controlled access uh certificate based access to the Google RPC service uh listening on a port on the device. So once we pushed up that certificate, we were able to communicate with uh gRPC, which we thought was going to be super helpful, but uh there was still not a lot of vulnerable code in there. So we spent a couple days continuing to look. Then finally, we came across this specific piece of functionality um which is write reservations. And as you can see in there, there's a uh a Ginga 2 template uh being referenced, right? So everyone's probably thinking template injection, but it's not. they're using it correctly. What it is, however, is configuration file injection, which is a much rarer and I think totally underrated vulnerability class. Um, and it kind of looks like this. This uh this functionality would what was this functionality doing? Uh, yeah, it was writing uh static IP reservations for the router, right? And so what it would

---

[27:50](https://youtube.com/watch?v=PXqlHAoF2wc&t=1670s)

do is dynamically generate this uh DHCPD file, config file, and it would put the IP address that we wanted to static into the fixed address attribute. However, it wasn't escaping the characters that would allow us to write other DHCPD commands. So we were able to identify a command that would uh run a shell command when a new DHCP lease was uh issued. And we were able to code golf it so that uh it keeps the correct syntax and doesn't break anything. And so then we after we got that in place and the exploit went off successfully, we grabbed our phones, connected to the device, and we saw that beautiful shell connection come back. Um, which is one of my favorite moments I've ever had hacking. Uh, Joel knows that I like jumped up and screamed and it was amazing. Um, so that one was uh 20 to 32K once again on a public program and uh I'm pretty proud of this fact. It took us like from zero from knowing nothing about this target about 10 days to get that shell. Um, and so I think uh, and I thought it was going to be a lot harder than that. So don't shy away

---

[28:52](https://youtube.com/watch?v=PXqlHAoF2wc&t=1732s)

from these sort of things if you're intimidated by it like I was. Um, takeaways from this one is hack with a collaborator or Joel Margolus, one of those two. Um, don't be afraid of hacking different types uh, of scope. Get your hands on source code as much as you possibly can. And uh, obviously configuration file injection is a pretty underrated ven class, I think, especially in the IoT world. Okay, we're just going to do it again real quick. Uh, and then we'll move on to the next one. Um, this one was really interesting though, so I wanted to include it. Another vulnerable endpoint on that same target was doing the same thing for DNS mask. Uh, so we're like, okay, let's see if we can do the same thing there. So, of course, we Google how to execute code with DNS mask config and nothing comes up. Unfortunately, there's not a great way to do that. However, what every good DNS caching software needs is a built-in TFTP server. Yeah. Uh so essentially that can be turned on via a DHCPD configuration. Uh and you are a then you will just be

---

[29:53](https://youtube.com/watch?v=PXqlHAoF2wc&t=1793s)

able to have FTP on the whole file system and we're able to grab another file that could have a lot of impact. The problem was is that we had double injection points this time around in the template. Okay. And we really got stuck here for a long time because the user root uh directive which is required to open up this uh TFTP server is uh cannot be duplicated twice. Just that one directive. Everything else can be duplicated but the user route cannot. Um and so because of the double injection points we having a really hard uh time with that. So the solution of course is to reach out to Sam Herb, Googler and double time black badge guy and say, "Hey, we've got this problem." And what does Sam do? Of course, he just opens up the C code for uh DNS mass and starts reviewing how lines are getting parsed. Um which is very Sam herb of him to do. Uh and he comes back and he says, "Hey, there's a maximum uh character length on

---

[30:54](https://youtube.com/watch?v=PXqlHAoF2wc&t=1854s)

a config line for DNS mask." and that's 1,025. So you might be able to uh essentially align the directive that you need and uh essentially utilize that maximum length to uh create a discrepancy between your two injection points. Um that's the the code that's vulnerable. It's not really vulnerable. It's just useful in this scenario. Um and so what we did is one of those two uh double injection points was the line was much longer than the other one. So uh on the shorter line we created a um an injection that would not exceed the 1,025 byt limit and uh our user root directive would be uh placed inside of a comment at the end of that uh towards the end of that line but not at the end. And then on the longer injection, let me see if I can show you. Yeah, at the longer injection um the line would overflow the comments would be longer and line up user root just on the on the

---

[31:56](https://youtube.com/watch?v=PXqlHAoF2wc&t=1916s)

new line uh that would be read uh when parsing the config file. So that was able to get one of our user root directives um in a commented out state and the other one would get bumped to the next line of the DNS mass config file. Um so this is what the exploit looked like at the end. You can see the uh the top comment uh says has user uh colon root at the end and then all the other directives which are fine to repeat and then the IP set line has a bunch of A's and then the A's are right up to that uh 1,025 byt limit and then user route gets dropped down into the next line and uh gets parsed uh and executed. So using that we were able to open up a TFTP server on port 69 and connect and exfiltrate uh data that we needed uh to get RC on the target. Again that was another one uh same program. Uh I think maybe this was a little bit after the 10 days. It might have been 11 days or 12 days but we found it pretty quickly afterwards. Uh takeaway for this one is

---

[32:57](https://youtube.com/watch?v=PXqlHAoF2wc&t=1977s)

if it works do it again. Uh that's one of the big principles of bug bounty is if you find a bug in one particular area, there's very likely to be bugs that are similar to it else uh in a similar in a similar location. So definitely do your due diligence and go down that route. Okay, we're going to do another one really quick, but I'm going to get a drink of water first. Okay, bug number nine. We're doing really good. Actually, I'm moving a little fast. I may not use my full uh my full time block. Um, okay. So, this time we've got a version control binary SQL injection. And I'm going to make this one a little bit shorter because it's it's kind of complicated. So, we get this version control binary and I'm like, all right, let me see if I can do something out of my comfort zone and load it up into Gedra. And then I get a bunch of errors relating to Microsoft and CLR and .NET. So, I loaded up into Peak and we were able to get the source code out. uh which was great because apparently you can uh like decompile those binaries and

---

[34:00](https://youtube.com/watch?v=PXqlHAoF2wc&t=2040s)

you get some really clean source code. So we were looking at the source code and essentially what was happening is uh we would be able to upload a file to a web version control interface and that file could have a malicious name um and then it would be stored in the version control environment and the next time the user opened up uh and used that version control binary it would uh pull the malicious file down and insert it into a uh SQLite database. So if you name a file uh an SQL injection payload, it would uh fire that and escape the um the string in the SQLite query and run arbitrary SQL on the victim's machine. This was found in collaboration with an amazing hacker named and he reads C# code to fall asleep at night. So he was the original one who found this uh this sync. So how we exploited this was uh we were able to upload the file sync it down and then in the end uh we weren't able to get code execution but what we were able to do was uh actually run code which

---

[35:02](https://youtube.com/watch?v=PXqlHAoF2wc&t=2102s)

would attach the user's uh Chrome cookies which are stored in a SQLite database uh into and vacuum it into a BDB file and then recheck that file back into version control which would push it back up to the web app and then we could download and get atto on that victim's web version control account. Um, and so that one that was the end of the vault. That was where we changed it to. That one was 30 40K. And once again, wanted to reiterate, definitely hack with other hackers. It really expands your your knowledge, especially in areas where you're uncomfortable. Um, I have to admit, I I kind of underestimated SQLI. I kind of thought SQLI was a thing of the past, but they're out there and we see them pretty often in the live hacking events. Um, they're just a little bit deeper and sometimes they're not even just a little bit deeper. they're they're out there. Um, peak is super helpful for those sort of decompilation scenarios when the base language is I think like .NET or C#. Um, so definitely check that out. Um, and yeah, I really I really liked uh the exploitation scenario that we came up

---

[36:03](https://youtube.com/watch?v=PXqlHAoF2wc&t=2163s)

with there where we were able to vacuum the users uh cookies into the version control and use that to exfiltrate the file as well. Yeah. And maybe don't rule your own version control. That's a nice takeaway as well. That never seems to end well. Okay, now we are on to uh the very hard uh exploits. So, buckle up. This one's going to take a hot second. I'm going to get water again. Okay, target for this one was an inhome tabletop IoT device with camera and microphone. There's a couple out there. It's probably not the one you're thinking of, uh but it is one of the top four or five you would be thinking of. Um, the end goal of this was once again I wanted to do creepy that people always say, "Okay, it's possible, but I haven't seen before." And now I have. So I wanted to do no user interaction spying on uh some in somebody's house

---

[37:04](https://youtube.com/watch?v=PXqlHAoF2wc&t=2224s)

and essentially just teleport myself into their house. Uh, and so I started going after that path and I started ideulating on what the possibilities for this were. Here are a couple. We could get a no interaction shell in the device. That would be really challenging. We could gain some sort of uh insert company name here admin functionality on the device and maybe that would allow us to do it. We could bypass O specifically for the cam and micreated endpoints. We could compromise storage for video and audio feeds and maybe get access that way. Or we could access the built-in functionality to access the cam and uh and mic stuff via a full authentication bypass on that person's account. So, which one are we feeling, guys? Raise your hands. Put them up. I'm going to give a critical thinking t-shirt to anybody who gets it right. It was number three. And the first person I see with number three is this guy right here. So, I'll get you a t-shirt right after. Come up and get it. So, it was bypass O specifically for the cam and mic related endpoints. That's how we got it. So, let's go ahead and go

---

[38:05](https://youtube.com/watch?v=PXqlHAoF2wc&t=2285s)

down that path. Okay. This IoT device has a Android app and you can use that Android app. um to video chat with this tabletop device. Okay. And when you call yourself from the mobile app, there's an automatic answer on the IoT device just allowing you sort of pop into your house and say like, "Hey cat, how's it going?" Right? Um so I thought that was really sus and was a prime feature for accomplishing the goal that I mentioned before. So I started I took the mobile app and I threw it into Jad X and decompiled it and got the source code and then the never- ending story began. Okay, so this app was kind of locked down. So the first thing was it had root detection and there was some weird stuff with uh Google Play. So essentially what I had to do was patch the APK to uh run Freda and I did that with objection and then I would overwrite all of the root detection uh on the app so that it would think that I'm not I wasn't in a

---

[39:06](https://youtube.com/watch?v=PXqlHAoF2wc&t=2346s)

environment. Um and then uh and there was some emulator detection as well in there. Um and so then the next one was bypassing TLS pinning for HTTP. Of course they had that in place. Most apps do nowadays. And um so I had to come up and they had unfortunately a custom search pinning solution. Most of the time uh Joel, my boy here, has a uh public uh TLS pinning script that will just unpin most of the apps, which is super helpful. But this one was not so easy. So I had to break, you know, go into the code and find exactly where the search pinning was was occurring and overwrite those functions with um with the the JavaScript in the free to code. I'm gonna check my time really quickly. Oh, my phone died, so I'm not. What you got? 536. 5:36. All right. Thanks, guys. I was running uh my hotspot off of it for the last workshop, and then I looked down and it was dead. Um, okay. So, at that point, cool. We've bypassed pinning and we've got HTTP

---

[40:07](https://youtube.com/watch?v=PXqlHAoF2wc&t=2407s)

introspection. Great. Now, let's see how this whole calling thing works, right? Nope. because the calling thing is behind SIP and more more specifically SIPs which is uh the secure version of the SIP protocol. Okay, what is SIP? Well, let me tell you the session init protocol SIP is a signaling protocol to initiate, maintain and terminate realtime sessions that involve video, voice, messaging and other communication applications and services. SIP is widely used for voice and video calls. Great. Now I've got to deal with another protocol and it is also TLS wrapped. So bunch of stuff kind of going on there. So I start working on that and find a custom serpenting solution for SIPs and kind of uh am able to disable that. But burp while it is uh SIPs friendly is not SIPs compatible uh and will break the application if you try to proxy it. So uh what I needed realized I needed is and this is kind of how it looks right there. it'll issue the register request

---

[41:08](https://youtube.com/watch?v=PXqlHAoF2wc&t=2468s)

with the SIP HTTP verb um or the the register HTTP verb that's associated with SIP protocol. Uh but then it'll just break the the response. So I had to find a transparent proxy. Uh and for this I used polar proxy. Uh it was it's a transparent TLS and SSL inspection pro uh proxy. So I took that and I took the search for that and I inserted it into the trust store um for that specific mobile app and then I proxied all the stuff with uh through polar proxy and that would output a pcap file and then finally we had access to reading what was going on and I was get able to get introspection on zips without breaking the whole app. Um, we are probably we are probably a week or two into looking at this target at this point with no leads, no potential vans, no gadgets, nothing, just setup at this point, which is amazing to me as a bug hunter because normally I spend a lot of time looking to find gadgets and I feel sort of accomplished going along the way, but this was a big upfront

---

[42:09](https://youtube.com/watch?v=PXqlHAoF2wc&t=2529s)

investment and I think people that uh do this sort of thing, mobile hacking or um IoT device hacking have a lot more upfront, which is really tricky. Um that's something from a bug bounty perspective that the programs really need to help and minimize as much as possible if you want your mobile apps and your um IoT devices, your desktop applications to get uh as much interest as your web applications do. Okay, so now we finally get to see how all this works. Um so let's let's talk through that flow a little bit. So step one is uh let's talk about getting a call, receiving a call. So you open up the app and uh it it right away does a call to slap API gets SIP off token. Okay, with your uh O token associated with your account and then it will return a token that sort of looks like this. Uh it's sort of like a JT but it's not actually um B64 encoded and it has these various uh delimiters in them. Uh the ones that's most interesting to us is the payload delimiter. Okay. And in that payload delimiter there is um a uh

---

[43:11](https://youtube.com/watch?v=PXqlHAoF2wc&t=2591s)

a from field and a to field and a bunch of other fields. But the ones that are most interesting are the from and to field. Okay. Um so then what would happen then is they would take that off token that they got from the API request. They would put that as a header and SIP protocol which is very similar to HTTP in a lot of ways. The concepts are are very similar. There's headers and stuff like that and they look similar. Um and then it would put that off token into the request with its own uh SIP level from two and contact headers and that would essentially allow you to register uh the uh address of record that is in the two header. Okay. And uh when it does this registration it validates that the from and two fields from the off token match the from and two fields in the SIP request. And then somehow through black magic when somebody calls uh you your phone will ring. It's kind of nut. I I don't know how all that uh transport stuff happens in the background but I thought that was interesting. So I I I went ahead and moved along. Um and so now let's look at

---

[44:12](https://youtube.com/watch?v=PXqlHAoF2wc&t=2652s)

making a call. Okay. So say we want to call somebody else. So we go ahead and uh send a request to / API/initall off and we apply as a u we provide as a post parameter to that a target. Okay. And this target, sorry, this target will um be reflected uh in the payload in the from field or I'm sorry, the two fields because we're making a call. Um and that was great. And we then you use that uh to in an invite SIP request uh with the from and the two token or from and two headers matching the values in the O token. And then somehow through blackmagic uh the other person's device starts ringing and you go through all these networks uh and you send the TCP data through or the UDP data um depending on the flow. Okay. And once again I'm going to reiterate for that to happen the from and two headers in the SIP request have to match the uh the off token right. So let's talk let's talk a little bit about how we could fake a

---

[45:13](https://youtube.com/watch?v=PXqlHAoF2wc&t=2713s)

call. So in the API/init call uh request or call O request the target that we would specify was actually accepted arbitrary data. And so what that would allow us to do is then inject arbitrary data into that O token that is used at the SIP level. And so then what we proceeded to do was um close the the little delimiter there or put put a uh the person in for the two header so it doesn't fail. Semicolon out and then provide another header. five minutes. Oh wow. Okay, I gotta move. Um, then provide another from header uh as uh person two. Um, so this was this would look like the call was coming from person two, the person receiving the call and to person two, which right we we discussed earlier was how you automatically off into the device and check on your cat or whatever if you're calling from the mobile device. So we were able to uh smuggle in that from field and uh we would generate the the token with request number one

---

[46:16](https://youtube.com/watch?v=PXqlHAoF2wc&t=2776s)

put it into the invite uh SIP request and since the from and two fields matched and the um O token validated those two things uh the call would happen and it would auto answer. However, there was no contact field in the off token. So that was invalidated. And the contact thing is actually where the contact header is where the call gets actually routed to. Um, so then you could see it on your device and you would be looking through that person's uh IoT device. Um, which was nuts and I cannot believe it worked. Um, but wait, you might ask, what is up with the Fram header there, right? Um well the fram header was an interesting situation because uh as much as we thought we had source code there was one more challenge that awaited for us at that point um which was we're using polar proxy so how do we do repeater or intercept on these things to modify the requests as they were going through well the answer to that is a ton of Freda or Freda uh

---

[47:19](https://youtube.com/watch?v=PXqlHAoF2wc&t=2839s)

calls to overwrite and actually use the mobile client as our own you no proxy to send stuff through. Um, which was really painful. And unfortunately, the section that set that from header was automatically done inside of a dosso file, a binary file within the uh app. So, it couldn't be hooked very easily with Freda because of the situation. So, I was kind of lost at this point. What do I do? And I was talking to another awesome hacker named Space Raccoon and uh he advised, "Hey man, it's a you know, why don't you just patch the binary?" And I was like, that's scary as hell. I don't know how to do that. And then he realized or he told me that it's just a string. So just search the binary for that string and replace the O with an A and it will automatically put in a different header. So I did that in a hex editor and it worked. And then I was able to add another from header via the Java bindings which matched the O token and allowed me to bypass O and peer through anybody's desktop IoT device.

---

[48:23](https://youtube.com/watch?v=PXqlHAoF2wc&t=2903s)

Okay. And that was a 20 to 50k bug. Um, and takeaways for that were set a goal and go after it really hard because some of this crazy stuff that they talk about in the horror stories is really possible. Um, and I've become a believer in that since uh this happened. Last bug is really quick. Um, and I I should be able to to go through pretty quickly because it's in the same stack. Um, this was a a bug where you could hijack calls going to other people. And the way that you did that was using that token uh the call off token. Um, so let me uh yeah, so you can see here right that the register token as a reminder uh the register token where you register your name has a two and from field that match. The call token has a from and two field that are different from each other because you're calling somebody else, right? Um when we look at the register SIP request that occurs, um there's this caveat in the from section which

---

[49:25](https://youtube.com/watch?v=PXqlHAoF2wc&t=2965s)

essentially allows for this feature called third party registration where you are registering for somebody else. Now when we use the init call um HTTP request to generate the token uh we can specify a different from or a different to header in that O token right because that's the person we're calling to. So then we could take that token which has the same signature and apply it to the register header and it will have a from header that is different from the two header and the two header can be any one that we specify. So then we could register essentially do a third party register for any other user and map their address of record right the thing that routes the call to them to our contact location. Uh and then when somebody calls that user our device would start ringing and that one was another uh 20 to 50k critical critical critical on a public program. And uh takeaways are pretty much the same. Uh but don't be afraid of new protocols. Uh, and that is

---

[50:27](https://youtube.com/watch?v=PXqlHAoF2wc&t=3027s)

that is one of the biggest takeaways I've found in my many many years of bug bounty. All right, that was the recap. 11 bugs, all paid is critical. The grand total for this was somewhere between 225 and 400K for all those bugs. And that's it. Thank you guys. [Applause]