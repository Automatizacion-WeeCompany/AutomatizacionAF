export const VALIDACIONES_PANTALLA = {
    PropuestaCotizacion: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
            {
                nombre: 'Nombre',
                selector: 'input[placeholder="Escribe el nombre"]'
            },
            {
                nombre: 'Apellido',
                selector: 'input[placeholder="Escribe el apellido"]'
            },
            {
                nombre: 'FechaNacimiento',
                selector: '#datepickerBirthday'
            }
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPropuestaCotizacionEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPropuestaCotizacionEng.json',
            Port: './src/textosEsperados/TextosEsperadosPropuestaCotizacionPort.json'
        }
    },

    SeleccionarPlanes: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoDosEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoDosEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoDosPort.json'
        }
    },
    ResumenCotizacion: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoTresEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoTresEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoTresPort.json'
        }
    },
    ResumenPlanesCotizados: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoCuatroEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoCuatroEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoCuatroPort.json'
        }
    },
    ResumenPlanesCotizadosModal: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoCuatroModalEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoCuatroModalEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoCuatroModalPort.json'
        }
    },
    InformacionPersonal: {
        iframeSelector: 'iframe#ifCotizador',
        placeholders: [
            {
                nombre: 'Fecha de Nacimiento',
                selector: 'input[placeholder="MM/DD/AAAA"]'
            }
        ],
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoCincoEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoCincoEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoCincoPort.json'
        }
    }
} as const;
