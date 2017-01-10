# Fraud-Blocker-multi-browser-extension
Main features:
* **Blocks** requests to sites retained fraudulent (in our database) 
* **Warns** giving number of users' reports on the button on toolbar when the user is browsing a site reported as fraudulent (but still not confirmed to be fraudster from us).
* Users can **Report** a site as fraudlent or **Contro-report**, to feedback a site as non-fraudlent.


The system **expect** users to report fraudulent sites to keep the database up-to-date with the current threats etc.

It's *real-time*. Users are synchronized with the server on a delay of few minutes. If you report a site as fraudlent, all the other users will see ![example](https://fraudblocker.publicvm.com/images/fraud-1.png) (on toolbar) if they visit the reported site. That "1" indicates that one user reported the site.

___
##### Basically is just a mechanism that allow people to signal online frauds/scam/dangerous sites and propagate the updates to the others to warn them and after we confirm the fraud to completely block the access to the site
___

Currently it supports **Firefox** and **Chrome** on **GNU/Linux**, **Windows** and **OSX**. Unfortunately **Fiefox Mobile** is still not supported because of APIs incompatibilities.


##Firefox
The extension was originally written for Firefox and then ported to other browsers

You can Download if from the official [Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/fraud-blocker/)


##Chrome
To get the chrome source version, first clone the repository, then apply the patch by running `patch -p1 < chrome.patch` from the root directory of the extension

You can install it in your Chrome from [Chrome WebStore Page](https://chrome.google.com/webstore/detail/fraud-blocker/mbkgkcnibjdpieobolniabeakmlpfhhk)

##Privacy
We do not collect any personal information on users.

##Versioning
Version number have the following structure: MajorVersionNumber.MinorVersionNumber.PatchNumber

MajorVersionNumber is unused at the moment

MinorVersionNumber is updated when new features or graphics is implemented

PatchNumber changes when a patch is introduced, for bux fixing, improvements or other minor changes


##Internals
Internally the system works in this way: 
There are 3 lists that contain name servers: **white**,**black** and **grey**.
* The **white** list contains the sites that are known to be *non-fraudlent*
* The **black** list contains the sites that are known to be *fraudlent*
* The **grey** list contains the sistes that have been *reported by users as fraudlent*; this list also contains the number of people that have reported and the number of people that have contro-reported the signalation. In this way users feedback can reach the others in real-time.

UPDATE LOGIC:
There's a server that stores the lists and updates the end-points in real-time.
The client just ask for new values (added after a certain timestamp) and the server replies.
Some coherence problems must be issued now. Because name servers moves between the lists.
Synchronization between the three lists is maintained with the following logic:
* If a value is in white list then it can't be in any other list
* If a value is in black list then it can't be in grey list
* What about the white list? How is it possible to remove values from there?
  *Special routine tells the clients what records are revoked from the white list (they have a _flag_)


DATABASE (back-end) UPDATE LOGIC:
So in brief, to keep the database updated, records can be added to **white**,**black** and **grey** tables;
records can be removed from black and grey **but** the white table must keep all the records and when a records want to be removed from the clients, the _flag_ 'revoked' must be set to true; so the change is propagated to clients and the system works.


## Acknowledgements
Thanks to all the people that improve the system, users, developers and thanks to Mozilla AMO Editor team for their work.

