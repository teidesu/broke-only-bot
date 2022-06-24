import 'dotenv/config'
import {
    BotInline,
    BotInlineMessage,
    BotKeyboard,
    Dispatcher,
    filters,
    html,
    NodeTelegramClient,
} from '@mtcute/node'
import { decryptSecretMessage, encryptSecretMessage } from './secret'
import { createPage, getPage } from './telegraph-api'

const client = new NodeTelegramClient({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    storage: 'runtime/session',
})

const dp = new Dispatcher(client)

dp.onNewMessage(filters.start, async (msg) => {
    await msg.answerText(
        html`
            Hello! <br />
            This bot allows you to write messages that will only be available to
            <i>non</i>-<b>Premium</b> users. Only broke ass mfs will be able to
            read your secrets! <br /><br />
            Source code: <a href="//github.com/teidesu/broke-only-bot">GitHub</a
            ><br />
            Powered by <a href="//github.com/mtcute/mtcute">MTCute</a>
        `,
        {
            replyMarkup: BotKeyboard.inline([
                [BotKeyboard.switchInline('Try me >')],
            ]),
        }
    )
})

dp.onInlineQuery(async (query) => {
    if (query.user.isPremium) {
        return await query.answer([], {
            switchPm: {
                text: 'Only for non-Premiums!',
                parameter: '42',
            },
        })
    }

    if (!query.query) {
        return await query.answer([])
    }

    await query.answer(
        [
            BotInline.article('message', {
                title: '🌟🔫 Send message to non-Premiums',
                message: BotInlineMessage.text('Please wait...', {
                    replyMarkup: BotKeyboard.inline([
                        [BotKeyboard.callback('🕛', 'noop')],
                    ]),
                }),
            }),
        ],
        { cacheTime: 0, gallery: false }
    )
})

dp.onChosenInlineResult(async (upd) => {
    try {
        const pageId = await createPage(encryptSecretMessage(upd.query))

        await upd.editMessage({
            text: 'This message is only available to non-Premium users.',
            replyMarkup: BotKeyboard.inline([
                [BotKeyboard.callback('Read', `read:${pageId}`)],
            ]),
        })
    } catch (err) {
        await upd.editMessage({ text: `An error happened. ${err}` })
    }
})

dp.onCallbackQuery(filters.regex(/^read:(.+)/), async (query) => {
    try {
        const text = decryptSecretMessage(await getPage(query.match[1]))
        await query.answer({ text, alert: true })
    } catch (err) {
        await query.answer({ text: `An error happened. ${err}`, alert: true })
    }
})

client.run(
    {
        botToken: process.env.BOT_TOKEN!,
    },
    (user) => {
        console.log('Logged in as', user.username)
    }
)
