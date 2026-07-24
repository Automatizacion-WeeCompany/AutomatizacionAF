const SIN_PLACEHOLDERS = {
    Esp: [],
    Eng: [],
    Port: []
} as const;

export const VALIDACIONES_PANTALLA = {
    InicioSesion: {
        iframeSelector: null,
        textoListo: {
            Esp: 'Bienvenido',
            Eng: 'Welcome',
            Port: 'Bem-vindo'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosInicioSesionEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosInicioSesionEng.json',
            Port: './src/textosEsperados/TextosEsperadosInicioSesionPort.json'
        }
    },
    Cotizaciones: {
        iframeSelector: null,
        textoListo: {
            Esp: 'Nueva Cotización',
            Eng: 'New Quotation',
            Port: 'Nova Cotação'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosCotizacionesEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosCotizacionesEng.json',
            Port: './src/textosEsperados/TextosEsperadosCotizacionesPort.json'
        }
    },
    PropuestaCotizacion: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: '¿Cuál es el tipo de póliza a cotizar?',
            Eng: 'What is the type of policy?',
            Port: 'Qual é o tipo de apólice?'
        },
        placeholders: {
            Esp: [
                { nombre: 'Nombre', selector: 'input[placeholder="Escribe el nombre"]' },
                { nombre: 'Apellido', selector: 'input[placeholder="Escribe el apellido"]' },
                { nombre: 'FechaNacimiento', selector: '#datepickerBirthday' }
            ],
            Eng: [
                { nombre: 'Name', selector: 'input[placeholder="Enter name"]' },
                { nombre: 'LastName', selector: 'input[placeholder="Enter your last name"]' },
                { nombre: 'BirthDate', selector: '#datepickerBirthday' }
            ],
            Port: [
                { nombre: 'Nome', selector: 'input[placeholder="Digite o nome"]' },
                { nombre: 'Sobrenome', selector: 'input[placeholder="Digite seu sobrenome"]' },
                { nombre: 'DataNascimento', selector: '#datepickerBirthday' }
            ]
        },
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPropuestaCotizacionEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPropuestaCotizacionEng.json',
            Port: './src/textosEsperados/TextosEsperadosPropuestaCotizacionPort.json'
        }
    },
    SeleccionarPlanes: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: 'Seleccione si desea cotizar o comparar diferentes planes',
            Eng: 'Select an option to quote or compare different plans',
            Port: 'Selecione se deseja cotar ou comparar diferentes planos'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoDosEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoDosEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoDosPort.json'
        }
    },
    ResumenCotizacion: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: 'Planes a comparar y cotizar',
            Eng: 'Plan and Quote Information',
            Port: 'Planos para comparar e cotar'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoTresEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoTresEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoTresPort.json'
        }
    },
    ResumenPlanesCotizados: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: 'Resumen de los planes cotizados',
            Eng: 'Quote Summary',
            Port: 'Resumo dos planos cotados'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoCuatroEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoCuatroEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoCuatroPort.json'
        }
    },
    ResumenPlanesCotizadosModal: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: '¿Desea enviar el formulario de aplicación por email o contestarlo en este momento?',
            Eng: 'Do you want to send the application form by email or fill it out right now?',
            Port: 'Deseja enviar o formulário de aplicação por e-mail ou preenchê-lo agora?'
        },
        placeholders: SIN_PLACEHOLDERS,
        textosEsperados: {
            Esp: './src/textosEsperados/TextosEsperadosPasoCuatroModalEsp.json',
            Eng: './src/textosEsperados/TextosEsperadosPasoCuatroModalEng.json',
            Port: './src/textosEsperados/TextosEsperadosPasoCuatroModalPort.json'
        }
    },
    InformacionPersonal: {
        iframeSelector: 'iframe#ifCotizador',
        textoListo: {
            Esp: 'Información del Solicitante Primario',
            Eng: 'Proposed Insured Information',
            Port: 'Informações do Solicitante Principal'
        },
        placeholders: {
            Esp: [{ nombre: 'Fecha de Nacimiento', selector: 'input[placeholder="MM/DD/AAAA"]' }],
            Eng: [{ nombre: 'Date of Birth', selector: 'input[placeholder="MM/DD/YYYY"]' }],
            Port: [{ nombre: 'Data de Nascimento', selector: 'input[placeholder="MM/DD/AAAA"]' }]
        },
        textosEsperados: {
            Esp: './src/textosEsperados/textosEsperadosPasoCincoEsp.json',
            Eng: './src/textosEsperados/textosEsperadosPasoCincoEng.json',
            Port: './src/textosEsperados/textosEsperadosPasoCincoPort.json'
        }
    }
} as const;
