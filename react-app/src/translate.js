import axios from "axios";
import {stringify} from "query-string";

const YANDEX_KEY = "trnsl.1.1.20180909T070337Z.d452b0d324096857.b05018f1be77743684207c7bda3d7b54e3767659";

export const translateFrench = async (frenchWord) => {
    const config = {
        key: YANDEX_KEY,
        text: frenchWord,
        lang: 'fr-en',
        format: 'plain'
    };
    return axios.post(`https://translate.yandex.net/api/v1.5/tr.json/translate?${stringify(config)}`)
        .then(({data}) => data.text[0])
        .catch(console.error);
};
