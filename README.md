# Web Client for Archipelago Music Manuals
### What is this?
This is a website that allows players in Archipelago multiworlds to listen to music and send checks without the need of connecting to a manual client.
You can learn more about Manual [here](https://github.com/ManualForArchipelago/Manual).

### Currently Supported Manuals
- Touhou Official OST ([Manual_THMusic_Awesome7285](https://github.com/Awesome7285/manual_thmusic_awesome7285))
- Deltarune OST ([Manual_DeltaruneMusic_Snolid](https://github.com/SnolidIce/manual_deltarunemusic_snolid))
- Mashup Week: Megamix ([Manual_mwmm_theburger](https://github.com/TheBurgerTV2/Mashup-Week-Megamix-Manual-for-AP))
- Taylor Swift Discography ([Manual_TaylorSwiftDiscography_bennydreamly](https://github.com/benny-dreamly/Manuals/releases?q=TS&expanded=true))

### How do I use this?
There is currently no hosted website to go to, so you'll need to clone the code and provide audio files yourself.

### How do I contribute to this?
If you wish to contribute, please contact me first via the [Unofficial Archipelago Server](https://discord.gg/Nu4X9gmGDR). Creating the manual is most of the process, and to get it working with the website it will need to follow strict rules in how regions are created (A better tutorial on this part will be made later down the line hopefully).

Once you have your manual, the things you'll need to submit in your PR are:
- The regions.json, items.json and locations.json from your manual. This goes in the data folder.
- An info.json that also goes in the data folder. The required information is:
  - "album_type_name": This is the name of the *item* category that your albums are called.
  - "colon_names": Enable if your location names include the name of the album as well (In the format "\<Album>: \<Track>")
  - "use_alt_names": Enable this if your location names are different from the desired display name of the track. I recommend using this for tracks that have a non-english name so both the foreign and translated names can be displayed.
- Images used for the tracker in the tracker folder. Separate sub-folders by the names of the item categories. Size does not matter but they will be downsized to 40x40, and the images should be square.
- Edit the game select dropdown in index.json (line ~30) to include your manual. (This step will hopefully be removed)
- Provide some links to audio over discord (this does not need to be in your PR)