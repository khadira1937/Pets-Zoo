import express from "express"
import { getPayloadClient } from "./get-payload"
import { nextApp, nextHandler } from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { inferAsyncReturnType } from "@trpc/server"
import bodyParser from 'body-parser'
import { IncomingMessage } from 'http'
import { stripeWebhookHandler } from './webhooks'
import nextBuild from 'next/dist/build'
import path from 'path'
import { PayloadRequest } from 'payload/types'
import { parse } from 'url'



const app = express()

const PORT = Number(process.env.PORT) || 5000

const createContext = ({
    req, res
}: 
trpcExpress.CreateExpressContextOptions) => ({
    req,
    res,
})
export type ExpressContext = inferAsyncReturnType<
  typeof createContext
>


const start = async () => {
    const payload = await getPayloadClient({
        initOptions : {
            express : app , 
            onInit : async(cms) => {
                cms.logger.info(`Admin URL ${cms.getAdminURL()})` )
            },
        },
    })

    //kan kidwi 3la ycreer middlware kitsnet 3la express o next
    app.use('/api/trpc',trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext
    }))

    app.use((req, res) => nextHandler(req,res))
    
    nextApp.prepare().then(() => {
        payload.logger.info('Next.js started')

        app.listen(PORT , async ()=> {
            payload.logger.info(
                `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
                )
        })
    })

}

start()