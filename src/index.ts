import 'dotenv/config'
import { Dispatcher, filters, NodeTelegramClient } from '@mtcute/node'

const client = new NodeTelegramClient({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    storage: 'runtime/session',
})

const dp = new Dispatcher(client)

dp.onNewMessage(filters.start, async (msg) => {
    await msg.answerText('Hello, world!')
})

client.run(
    {
        botToken: process.env.BOT_TOKEN!,
    },
    (user) => {
        console.log('Logged in as', user.username)
    }
)
