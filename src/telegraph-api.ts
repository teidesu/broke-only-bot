import got from 'got-cjs'
import { randomBytes } from 'crypto'

const TOKEN = process.env.TELEGRAPH_TOKEN!

export async function createPage(text: string): Promise<string> {
    const page = await got
        .post('https://api.telegra.ph/createPage', {
            form: {
                access_token: TOKEN,
                title: randomBytes(32).toString('base64url'),
                author_name: 'BrokeAssMf',
                content: JSON.stringify([
                    {
                        tag: 'p',
                        children: [text],
                    },
                ]),
            },
        })
        .json<any>()

    if (!page.ok) {
        throw new Error(page.error)
    }

    return page.result.path
}

export async function getPage(id: string): Promise<string> {
    const page = await got
        .post(`https://api.telegra.ph/getPage/${id}`, {
            form: {
                access_token: TOKEN,
                return_content: true
            },
        })
        .json<any>()

    if (!page.ok) {
        throw new Error(page.error)
    }

    return page.result.content[0].children[0]
}
