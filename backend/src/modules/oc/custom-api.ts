import config from '../../config/index.js';

const OPENCODE_URL = config.OPENCODE_URL;

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
