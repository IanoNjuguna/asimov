# Where the visual direction comes from

Recon for Asimov, the app. Not a mood board: a list of sources, what each one gives, and the three
things worth putting in the product this week.

The rule behind all of it: the name is a claim about what the product is. Prediction markets are
psychohistory with money on it. If the interface does not say that, the name is decoration.

## Ideas worth taking

| From Asimov | What it means here |
| --- | --- |
| Psychohistory | Individual outcomes are unknowable, the mass is predictable. That is exactly what a price is. Use it as the feed's header line and the one-sentence pitch. |
| The Mule | One actor the model cannot price. In the app: markets moving against their own history, surfaced as their own view. A feature, not a flourish. |
| The Vault | Terminus's Vault opens on schedule, without ceremony. Markets close on schedule. Circular countdown, hard edge, no celebration animation. |
| The Encyclopaedia Galactica | Asimov told the future as archived record entries. A market screen that reads like a record entry rather than a betting slip is defensible and is not what competitors look like. |
| Trantor | Layers of architecture stacked across eras, brutalist and monolithic, chosen because the Empire was rigid. Design as argument for why a system is the way it is. |

## Art and bibliographic sources

| Source | What to take |
| --- | --- |
| [ISFDB](https://isfdb.org) | Start here. Every edition, every cover artist, every print run. Search "Foundation" for the Avon 1970s run and the 1983 Del Rey covers, all with artist credits. Lets you name what you are looking at. |
| [Michael Whelan](https://www.michaelwhelan.com) | Painted the 1983-86 Del Rey Foundation covers including Arkady on *Second Foundation*. Originals at usable size. This is the palette people remember. |
| [retrofuturisme.org](https://retrofuturisme.org) | Archive of retro-futurist illustrators: Alan Gutierrez, Barclay Shaw, Tony Roberts, Tomasz Setowski. Where the 1970s paperback geometry lives. |
| [Luminist Archives](https://luminist.org/archives/SF/) | Magazine covers and full scans: New Worlds, Galaxy, the pulp era. Texture and typographic rhythm rather than illustration. |
| [Penguin Science Fiction](http://www.penguinsciencefiction.org) | The strictest typographic system in the genre. Take layout rules, not pictures. |
| [Asimov Reviews blog](https://blog.asimovreviews.net) | A collector's running commentary on Foundation editions and covers. Fast orientation on what changed and why. |

## Primary material

Boston University's Howard Gotlieb Archival Research Center holds the papers: 459 boxes, manuscripts,
galleys, tear sheets and correspondence, 1933 to 1992. Finding aid:
[Asimov-Isaac-809.pdf](https://www.bu.edu/library/wp-assets/finding-aids/Asimov-Isaac-809.pdf).

Access is by appointment, gloves on, bags outside, and much of the material is disintegrating. Not a
sprint activity, but it is where the notebooks and the memorised book list live. Worth a visit when
there is a reason to.

## The Apple TV+ series, which is closest to our problem

It had to render psychohistory as an interface, which is what a feed is.

| Source | What to take |
| --- | --- |
| [Imaginary Forces on the title sequence](https://blog.frame.io/2022/09/12/made-in-frame-imaginary-forces-foundation) | The Prime Radiant: a particle field standing for psychohistory, drawn from brutalist design, old propaganda and sci-fi posters. Our aggregate view, already solved visually. |
| [Stephan Martinière on concept art](https://www.creativebloq.com/news/foundation-concept-art) | Trantor as "modern concrete architecture, monolithic and geometric, characteristics of brutalism", chosen because the Empire is rigid. Design carrying an argument. |
| [Rory Cheyne, production designer](https://mande.net/btl/awards/foundation-production-designer-rory-cheyne-interview) | Trantor built as layers of stacked eras. Useful when the app has to show a long time axis. |

## The three things to build from this

1. **A Prime Radiant strip** at the top of the feed: every live market as a dot, positioned by
   probability, sized by volume, tappable to filter. One canvas. It is the screen that makes the name
   mean something, and it demos in three seconds.
2. **A Mule flag**: markets that moved more than a set threshold in 24h, as their own chip. Computed
   from data the client already fetches.
3. **Type contrast**: a high-contrast serif for event titles over tabular mono for prices. Reads like
   a 1970s cover and scans better than the current single sans.

## Anti-patterns

- No starfields, no glowing orbital rings, no holographic gradients. The 1970s covers were flat colour
  and hard geometry, which is cheaper and looks less like a template.
- No lore copy on controls. "Seldon crisis" on a button is costume. Use the vocabulary in headlines at
  most once per screen.
- No portraits of Asimov, no quotes in the UI. The ideas are the inspiration; the likeness is a
  licensing question with no upside.

## Legal, one paragraph

The novels and the cover art are in copyright (Asimov died in 1992, so Foundation-era stories run to
the late 2030s). "Asimov's Science Fiction" is a live trademark held by its publisher. Names, ideas and
themes are not protectable, so an app called Asimov that draws on psychohistory is fine for this
hackathon. A commercial launch should look at the estate's licensing before shipping a wordmark, and
must not reproduce cover art or text.
