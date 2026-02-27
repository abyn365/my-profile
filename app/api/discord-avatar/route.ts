import { NextResponse } from 'next/server'

const DISCORD_USER_ID = '877018055815868426'

export async function GET() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN

    if (botToken) {
      const res = await fetch(`https://discord.com/api/v10/users/${DISCORD_USER_ID}`, {
        headers: { Authorization: `Bot ${botToken}` },
        next: { revalidate: 3600 }
      })

      if (res.ok) {
        const user = await res.json()
        if (user.avatar) {
          const ext = user.avatar.startsWith('a_') ? 'gif' : 'png'
          const url = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.avatar}.${ext}?size=256`
          return NextResponse.json({ url }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
        }
      }
    }

    const url = `https://cdn.discordapp.com/embed/avatars/0.png`
    return NextResponse.json({ url }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
  } catch (error) {
    console.error('Discord avatar error:', error)
    return NextResponse.json(
      { url: `https://cdn.discordapp.com/embed/avatars/0.png` },
      { status: 200 }
    )
  }
}
