declare var CKEDITOR;

export class CKEditorConfigLoader {
    static load(config: CKEditorConfig) {
        CKEDITOR.editorConfig = config;
    }
}

export interface CKEditorConfig {
    height: number;
    extraPlugins: string;
    disableNativeSpellChecker: boolean;

    removePlugins: string;
    resize_enabled: boolean;

    // IE8 needs skin set explicitly
    skin: string;

    toolbar: { name: string, groups?: string[], items: string[] }[];
    specialChars: string[];
}

export class CKEditorDefaultConfig implements CKEditorConfig {
    height: number = 100;
    extraPlugins: string = 'blockquote,removeformat,indent,indentlist,indentblock,confighelper';
    disableNativeSpellChecker: boolean = false;

    removePlugins: string = "elementspath,tabletools,contextmenu";
    resize_enabled: boolean = true;

    // IE8 needs skin set explicitly
    skin: string = 'moono';

    toolbar: { name: string, groups?: string[], items: string[] }[] = [
        { name: 'vn-answerbank', items: ['vn-answerbank'] },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat'] },
        { name: 'paragraph', groups: ['list', 'blocks'], items: ['NumberedList', 'BulletedList', '-', 'Blockquote', 'Link'] }
    ];
    specialChars: string[] = ["&euro;", "&lsquo;", "&rsquo;", "&ldquo;", "&rdquo;", "&ndash;", "&mdash;", "&iexcl;", "&cent;", "&pound;", "&curren;",
        "&yen;", "&brvbar;", "&sect;", "&uml;", "&copy;", "&ordf;", "&laquo;", "&not;", "&reg;", "&macr;", "&deg;", "&sup2;", "&sup3;", "&acute;", "&micro;", "&para;",
        "&middot;", "&cedil;", "&sup1;", "&ordm;", "&raquo;", "&frac14;", "&frac12;", "&frac34;", "&iquest;", "&Agrave;", "&Aacute;", "&Acirc;", "&Atilde;", "&Auml;",
        "&Aring;", "&AElig;", "&Ccedil;", "&Egrave;", "&Eacute;", "&Ecirc;", "&Euml;", "&Igrave;", "&Iacute;", "&Icirc;", "&Iuml;", "&ETH;", "&Ntilde;", "&Ograve;",
        "&Oacute;", "&Ocirc;", "&Otilde;", "&Ouml;", "&times;", "&Oslash;", "&Ugrave;", "&Uacute;", "&Ucirc;", "&Uuml;", "&Yacute;", "&THORN;", "&szlig;", "&agrave;",
        "&aacute;", "&acirc;", "&atilde;", "&auml;", "&aring;", "&aelig;", "&ccedil;", "&egrave;", "&eacute;", "&ecirc;", "&euml;", "&igrave;", "&iacute;", "&icirc;",
        "&iuml;", "&eth;", "&ntilde;", "&ograve;", "&oacute;", "&ocirc;", "&otilde;", "&ouml;", "&divide;", "&oslash;", "&ugrave;", "&uacute;", "&ucirc;", "&uuml;",
        "&yacute;", "&thorn;", "&yuml;", "&OElig;", "&oelig;", "&#372;", "&#374", "&#373", "&#375;", "&sbquo;", "&#8219;", "&bdquo;", "&hellip;", "&trade;", "&#9658;",
        "&bull;", "&rarr;", "&rArr;", "&hArr;", "&diams;", "&asymp;"];

    constructor(extraPlugins: string = null) {
        if (extraPlugins) {
            this.extraPlugins = `${extraPlugins},${this.extraPlugins}`;
        }
    }
}