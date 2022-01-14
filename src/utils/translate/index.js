import en from './en';
import ch from './ch';

const Translate = (key) => {
    const language = window.lang;

    if (language == 'en') return en[key];
    else return ch[key];
}

export default Translate;