# Discord Wrapped Bot

A simple Discord bot that tracks server activity and generates weekly or monthly wrapped summaries.

The project is built to be small, readable, and easy to self-host.

---

## Features

- Message activity tracking
- Reaction activity tracking
- Reaction emoji statistics
- Weekly wrapped summaries
- Monthly wrapped summaries
- SQLite storage
- Simple slash commands

---

## Example wrapped summary

```txt
Weekly Wrapped

12,430 messages sent
86 active members
Top channel: #general
Busiest day: Friday
Peak hour: 21:00

1,204 reactions added
Top emoji: 💀
Most reactive member: @alex
```

---

## Stack

- Node.js
- TypeScript
- discord.js
- SQLite
- Drizzle ORM
- Zod

---

## Project structure

```txt
src/
  index.ts

  config/
    env.ts

  discord/
    client.ts
    registerEvents.ts
    events/
      onMessageCreate.ts
      onMessageReactionAdd.ts

  metrics/
    MetricsTracker.ts
    MetricName.ts
    TimeBucket.ts

  db/
    connection.ts
    schema.ts
    repositories/
      metricsRepository.ts

  wrapped/
    buildWeeklyWrapped.ts
    buildMonthlyWrapped.ts
    wrappedQueries.ts
    renderWrappedEmbed.ts      // Smart renderer (image + fallback)
    renderWrappedEmbedText.ts  // Original text-only renderer
    image/
      loadFonts.ts
      renderWrappedImage.ts
      templates/
        WrappedCard.tsx
        components/
          Stat.tsx
          BarRow.tsx
          SectionTitle.tsx
      fonts/
        Inter-Regular.ttf
        Inter-Bold.ttf

  utils/
    dates.ts
    logger.ts
```

---

## How it works

```txt
Discord event
  -> event handler
  -> metrics tracker
  -> in-memory buffer
  -> periodic SQLite flush
on a "wrapped query" command / schedule :
  -> read database
  -> send Discord embed
```

Metrics are buffered in memory and periodically flushed to SQLite to keep event handling fast.

---

## Metrics

### Messages

Tracks message counts by:

- Server
- Channel
- Member
- Time bucket

### Reactions

Tracks reaction counts by:

- Server
- Channel
- Member
- Emoji
- Time bucket

### Emojis

Tracks reaction emoji usage by:

- Server
- Channel
- Member
- Emoji
- Time bucket

---

## Data model

The main table stores aggregated metric buckets.

```txt
metric_buckets
```

Suggested fields:

```txt
id
guild_id
metric_name
bucket_start
bucket_granularity
value
channel_id
user_id
emoji_id
emoji_name
```

Example rows:

```txt
guild_id   metric_name        bucket_start         value   user_id   channel_id   emoji_name
123        messages.sent      2026-01-01 18:00    42      456       789
123        reactions.added    2026-01-01 18:00    12      456       789          💀
123        emojis.used        2026-01-01 18:00    5       456       789          💀
```

---

## Commands

```txt
/wrapped weekly
/wrapped monthly
```

---

## Configuration

Create a `.env` file:

```env
DISCORD_TOKEN=
DATABASE_URL=file:./data/app.db
METRICS_FLUSH_INTERVAL_MS=10000
```

---

## Customizing the wrapped card

The generated image is built using JSX templates, which makes it easy to restyle without touching complex canvas APIs.

- **Templates**: Located in `src/wrapped/image/templates/`. The main card is `WrappedCard.tsx`.
- **Components**: Reusable UI pieces like `Stat.tsx` and `BarRow.tsx` are in `src/wrapped/image/templates/components/`.
- **Styling**: We use inline styles with standard CSS properties. Note that Satori only supports **Flexbox** layout.
- **Fonts**: Inter Regular and Bold are loaded from `src/wrapped/image/fonts/`. If you change fonts, update `loadFonts.ts`.
- **Pipeline**: `renderWrappedImage.ts` handles the conversion from JSX -> SVG (Satori) -> PNG (Resvg).

To change colors or spacing, simply edit the inline styles in `WrappedCard.tsx` or its components.

---

## License

MIT
