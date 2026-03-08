import config from '../../config/index.js';
import * as sdk from '@opencode-ai/sdk';

const OPENCODE_URL = config.OPENCODE_URL;

let ocClient: any = undefined;
let ocEventHandler: OCEventHandler | undefined;

export type OCEventHandler = (event: any) => Promise<void>;

async function getOCClient(onEvent?: OCEventHandler) {
    if (onEvent) ocEventHandler = onEvent;
    if (!ocClient) {
        ocClient = sdk.createOpencodeClient({ baseUrl: OPENCODE_URL });

        (async () => {
            try {
                const response = await ocClient.event.subscribe();
                console.log('[OpenCode] SSE subscription started');
                for await (const event of response.stream) {
                    if (ocEventHandler) await ocEventHandler(event);
                }
            } catch (error) {
                console.error('[OpenCode] SSE subscription error:', error);
                ocClient = null;
            }
        })();
    }
    return ocClient;
}

export interface QuestionAnswer {
    /** The index or id for the answer to the question */
    [index: string]: string;
}

export interface QuestionReplyResponses {
    /**
     * Question answered successfully
     */
    200: boolean;
}

export interface QuestionReplyErrors {
    /**
     * Bad request
     */
    400: any;
    /**
     * Not found
     */
    404: any;
}

export interface QuestionRejectResponses {
    /**
     * Question rejected successfully
     */
    200: boolean;
}

export const customOCApi = {
    /**
     * Initialize the OpenCode client and start SSE event subscription.
     * onEvent is called for each incoming event.
     */
    async init(onEvent?: OCEventHandler) {
        return getOCClient(onEvent);
    },

    session: {
        /**
         * Create a new OpenCode session
         */
        async create(title: string): Promise<{ id: string; title: string }> {
            const client = await getOCClient();
            const result = await client.session.create({ body: { title } });
            return result.data;
        },

        /**
         * Send an async prompt to an OpenCode session
         */
        async promptAsync(parameters: {
            sessionId: string;
            providerID: string;
            modelID: string;
            text: string;
        }): Promise<void> {
            const client = await getOCClient();
            await client.session.promptAsync({
                path: { id: parameters.sessionId },
                body: {
                    model: {
                        providerID: parameters.providerID,
                        modelID: parameters.modelID,
                    },
                    parts: [{ type: 'text', text: parameters.text }]
                }
            });
        }
    },

    question: {
        /**
         * Reply to question request
         *
         * Provide answers to a question request from the AI assistant.
         */
        async reply(parameters: {
            requestID: string;
            directory?: string;
            answers?: any; // The original SDK sets this as Array<QuestionAnswer>
        }): Promise<QuestionReplyResponses['200']> {
            const url = new URL(`/question/${parameters.requestID}/reply`, OPENCODE_URL);

            if (parameters.directory) {
                url.searchParams.append('directory', parameters.directory);
            }

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Additional headers can be merged here if required by OpenCode auth etc.
                },
                body: JSON.stringify({
                    answers: parameters.answers
                })
            });
            console.log('Question reply response:', response);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Question reply failed: ${response.status} ${response.statusText} ${errorText}`);
            }

            // Expecting boolean or JSON based on SDK response types: "200: boolean"
            // We just return true to match 'Question answered successfully'
            return true;
        },

        /**
         * Reject question request
         *
         * Reject a question request from the AI assistant.
         */
        async reject(parameters: {
            requestID: string;
            directory?: string;
        }): Promise<QuestionRejectResponses['200']> {
            const url = new URL(`/question/${parameters.requestID}/reject`, OPENCODE_URL);

            if (parameters.directory) {
                url.searchParams.append('directory', parameters.directory);
            }

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Question reject response:', response);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Question reject failed: ${response.status} ${response.statusText} ${errorText}`);
            }

            return true;
        }
    }
};
