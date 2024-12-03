import axios from 'axios';

const URL = process.env.API_URL


export const api = {

    check_exist_by_id(userId: string): Promise<{ status: number, text: string }> {

        return axios
            .post(`${URL}api/users/check_exist_by_id`, {userId: userId})
            .then(res => {

                const {status, text} = res.data;
                return {status, text};


            })
            .catch(err => {

                if (
                    'response' in err
                    && 'data' in err.response
                    && 'text' in err.response.data
                    && 'status' in err.response.data
                ) {
                    const {status, text} = err.response.data;
                    return {status, text}
                } else {
                    return {status: 2, text: 'server_error'}
                }

            })
    },
}
