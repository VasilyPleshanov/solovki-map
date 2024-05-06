ymaps.ready(['Panel']).then(function () {
    var LAYER_NAME = 'user#layer',
        MAP_TYPE_NAME = 'user#customMap',
        /* Для того чтобы вычислить координаты левого нижнего и правого верхнего углов прямоугольной координатной
         * области, нам необходимо знать максимальный зум, ширину и высоту изображения в пикселях на максимальном зуме.
         */
        MAX_ZOOM = 4,
        PIC_WIDTH = 4096,
        PIC_HEIGHT = 4096;
    /**
     * Конструктор, создающий собственный слой.
     */
    var Layer = function () {
        // var layer = new ymaps.Layer('images/tiles/%z/%yx%x.png', {

        // new
        var layer = new ymaps.Layer('https://disk.yandex.ru/d/o3-w5lo5px7rmA/images/tiles/%z/%yx%x.png', {
            // Если есть необходимость показать собственное изображение в местах неподгрузившихся тайлов,
            // раскомментируйте эту строчку и укажите ссылку на изображение.
            // notFoundTile: 'url'
        });
        // Указываем доступный диапазон масштабов для данного слоя.
        layer.getZoomRange = function () {
            return ymaps.vow.resolve([0, 4]);
        };
        // Добавляем свои копирайты.
        layer.getCopyrights = function () {
            return ymaps.vow.resolve('©');
        };
        return layer;
    };
    // Добавляем в хранилище слоев свой конструктор.
    ymaps.layer.storage.add(LAYER_NAME, Layer);
    /**
     * Создадим новый тип карты.
     * MAP_TYPE_NAME - имя нового типа.
     * LAYER_NAME - ключ в хранилище слоев или функция конструктор.
     */
    var mapType = new ymaps.MapType(MAP_TYPE_NAME, [LAYER_NAME]);
    // Сохраняем тип в хранилище типов.
    ymaps.mapType.storage.add(MAP_TYPE_NAME, mapType);
    // Вычисляем размер всех тайлов на максимальном зуме.
    var worldSize = Math.pow(2, MAX_ZOOM) * 256,
        /**
         * Создаем карту, указав свой новый тип карты.
         */
        map = new ymaps.Map('map', {
            center: [0, 0],
            zoom: 0,
            // controls: ['zoomControl'],
            controls: [],
            type: MAP_TYPE_NAME
        }, {

            // Задаем в качестве проекции Декартову. При данном расчёте центр изображения будет лежать в координатах [0, 0].
            projection: new ymaps.projection.Cartesian([[PIC_HEIGHT / 2 - worldSize, -PIC_WIDTH / 2], [PIC_HEIGHT / 2, worldSize - PIC_WIDTH / 2]], [false, false]),
            // Устанавливаем область просмотра карты так, чтобы пользователь не смог выйти за пределы изображения.
            restrictMapArea: [[-PIC_HEIGHT / 2, -PIC_WIDTH / 2], [PIC_HEIGHT / 2, PIC_WIDTH / 2]]

            // При данном расчёте, в координатах [0, 0] будет находиться левый нижний угол изображения,
            // правый верхний будет находиться в координатах [PIC_HEIGHT, PIC_WIDTH].
            // projection: new ymaps.projection.Cartesian([[PIC_HEIGHT - worldSize, 0], [PIC_HEIGHT, worldSize]], [false, false]),
            // restrictMapArea: [[0, 0], [PIC_HEIGHT, PIC_WIDTH]]
        });

    // Создадим пользовательский макет ползунка масштаба.
    ZoomLayout = ymaps.templateLayoutFactory.createClass("<div>" +
        "<div id='zoom-in' class='btn btn-map'><i class='icon-plus'></i></div><br>" +
        "<div id='zoom-out' class='btn btn-map'><i class='icon-minus'></i></div>" +
        "</div>", {

        // Переопределяем методы макета, чтобы выполнять дополнительные действия
        // при построении и очистке макета.
        build: function () {
            // Вызываем родительский метод build.
            ZoomLayout.superclass.build.call(this);

            // Привязываем функции-обработчики к контексту и сохраняем ссылки
            // на них, чтобы потом отписаться от событий.
            this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
            this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

            // Начинаем слушать клики на кнопках макета.
            $('#zoom-in').bind('click', this.zoomInCallback);
            $('#zoom-out').bind('click', this.zoomOutCallback);
        },

        clear: function () {
            // Снимаем обработчики кликов.
            $('#zoom-in').unbind('click', this.zoomInCallback);
            $('#zoom-out').unbind('click', this.zoomOutCallback);

            // Вызываем родительский метод clear.
            ZoomLayout.superclass.clear.call(this);
        },

        zoomIn: function () {
            var map = this.getData().control.getMap();
            map.setZoom(map.getZoom() + 1, { checkZoomRange: true });
        },

        zoomOut: function () {
            var map = this.getData().control.getMap();
            map.setZoom(map.getZoom() - 1, { checkZoomRange: true });
        }
    }),
        zoomControl = new ymaps.control.ZoomControl({ options: { layout: ZoomLayout, position: { right: 0, top: 200 } } });

    // map.controls.add(zoomControl);

    var zoomControl = new ymaps.control.ZoomControl({ options: { position: { right: 0, top: 0 } } });
    map.controls.add(zoomControl);

    // Метки
    // Создадим контент для меток.
    var firstOffice = '<h2>Соловецкий монастырь</h2>' +
        '<p><img style="width: 190px;" src="images/solovki.jpg"></p>' +
        '<p>Возник в 1420—1430-х годах, отстроен в камне трудами святителя Филиппа, в допетровское время числился среди крупнейших землевладельцев государства. В 1669—1676 годах был осаждён царскими войсками как один из очагов сопротивления никонианским преобразованиям.</p>';
    var secondOffice = '<h2>Секирная гора</h2><p><img style="width: 190px;" src="images/sekirnay.jpg"></p><p>Холм на Большом Соловецком острове. Высота — 77,5 метра над уровнем моря. Административно относится к Соловецкому сельскому поселению Приморского района Архангельской области России. На горе расположен Вознесенский скит Соловецкого монастыря. На самой вершине Секирной горы построена церковь-маяк.</p>';

    // Создаём макет содержимого.
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="color: #000000; font-weight: bold;">$[properties.iconContent]</div>'
    )

    // Создадим и добавим панель на карту.
    var panel = new ymaps.Panel();
    map.controls.add(panel, {
        float: 'left'
    });
    // Создадим коллекцию геообъектов.
    var collection = new ymaps.GeoObjectCollection(null, {
        // Запретим появление балуна.
        hasBalloon: false,
        iconColor: '#3b5998'
    });
    // Добавим геообъекты в коллекцию.
    collection
        .add(new ymaps.Placemark([-620, 230], {
            balloonContent: firstOffice,
            iconContent: '1'
        }, {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#imageWithContent',
            // Своё изображение иконки метки.
            // iconImageHref: 'images/icons.png',
            iconImageHref: 'images/location-mark.png',
            // Размеры метки.
            iconImageSize: [48, 48],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-24, -24],
            // Смещение слоя с содержимым относительно слоя с картинкой.
            iconContentOffset: [19.5, 12],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout
        }))
        .add(new ymaps.Placemark([-280, -150], {
            balloonContent: secondOffice,
            iconContent: '2'
        }, {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#imageWithContent',
            // Своё изображение иконки метки.
            // iconImageHref: 'images/icons.png',
            iconImageHref: 'images/location-mark.png',
            // Размеры метки.
            iconImageSize: [48, 48],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-24, -24],
            // Смещение слоя с содержимым относительно слоя с картинкой.
            iconContentOffset: [19.5, 12],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout
        }))
    // Добавим коллекцию на карту.
    map.geoObjects.add(collection);
    // Подпишемся на событие клика по коллекции.
    collection.events.add('click', function (e) {
        // Получим ссылку на геообъект, по которому кликнул пользователь.
        var target = e.get('target');
        // Зададим контент боковой панели.
        panel.setContent(target.properties.get('balloonContent'));
        // Переместим центр карты по координатам метки с учётом заданных отступов.
        map.panTo(target.geometry.getCoordinates(), { useMapMargin: true });
    });

});

// ------------------------------------------------------------

