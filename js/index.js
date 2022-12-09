
window.addEventListener('load', () => {

  const { io, socket } = require('./core/watch.js');
  const EditorUi = require('./src/EditorUi.js');
  const params = (new URL(window.location)).searchParams;
  const room = params.get('room');
  const username = params.get('username');
  const RoomNotFound = 'Clave de la Sala';
  const UserNotFound = 'Codigo Unico del usuario';



  // Extends EditorUi to update I/O action states based on availability of backend

  var editorUiInit = EditorUi.prototype.init;

  EditorUi.prototype.init = function () {

    editorUiInit.apply(this, arguments);
    this.actions.get('export').setEnabled(true);

    // Updates action states which require a backend
    Editor.useLocalStorage = true;
    Editor.useFileSystemSave = true;
    if (!Editor.useLocalStorage) {
      mxUtils.post(OPEN_URL, '', mxUtils.bind(this, function (req) {
        var enabled = req.getStatus() != 404;
        this.actions.get('open').setEnabled(enabled || Graph.fileSupport);
        this.actions.get('import').setEnabled(enabled || Graph.fileSupport);
        this.actions.get('save').setEnabled(enabled);
        this.actions.get('saveAs').setEnabled(enabled);
        this.actions.get('export').setEnabled(enabled);
      }));
    }

    this.actions.addAction('new...', function () {
      var answer = window.confirm("Estas seguro en crear un nuevo diagrama?");
      if (answer) {

        EditorUi.prototype.editor.setGraphXml(window.parent.mxUtils.parseXml('<mxGraphModel dx="667" dy="662" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>').documentElement);
        // EditorUi.prototype.editor.setGraphXml(window.parent.mxUtils.parseXml('<mxGraphModel dx="273" dy="625" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Persona" style="shape=actor;whiteSpace=wrap;html=1;fontStyle=1;fontFamily=Helvetica;fontSize=14;fillColor=#438dd4;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;" parent="1" vertex="1"><mxGeometry x="110" y="260" width="160" height="90" as="geometry"/></mxCell><mxCell id="3" value="Database" style="shape=cylinder;whiteSpace=wrap;html=1;fontStyle=1;fontFamily=Helvetica;fontSize=14;fillColor=#438dd4;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;" parent="1" vertex="1"><mxGeometry x="80" y="60" width="160" height="90" as="geometry"/></mxCell></root></mxGraphModel>').documentElement);
      }


    });

    // this.actions.addAction('import...', function () {
    //   var answer = window.confirm("Estas seguro en importar un nuevo diagrama?");
    //   if (answer) {
    //     // EditorUi.prototype.editor.setGraphXml(window.parent.mxUtils.parseXml('<mxGraphModel dx="667" dy="662" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>').documentElement);
    //     // EditorUi.prototype.editor.setGraphXml(window.parent.mxUtils.parseXml('<mxGraphModel dx="273" dy="625" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Persona" style="shape=actor;whiteSpace=wrap;html=1;fontStyle=1;fontFamily=Helvetica;fontSize=14;fillColor=#438dd4;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;" parent="1" vertex="1"><mxGeometry x="110" y="260" width="160" height="90" as="geometry"/></mxCell><mxCell id="3" value="Database" style="shape=cylinder;whiteSpace=wrap;html=1;fontStyle=1;fontFamily=Helvetica;fontSize=14;fillColor=#438dd4;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;" parent="1" vertex="1"><mxGeometry x="80" y="60" width="160" height="90" as="geometry"/></mxCell></root></mxGraphModel>').documentElement);

    //     // Create a form dynamically
    //     var form = document.createElement("form");
    //     form.setAttribute("method", "post");
    //     form.setAttribute("action", "submit.php");

    //     // Create an input element for emailID
    //     var ID = document.createElement("input");
    //     ID.setAttribute("type", "text");
    //     ID.setAttribute("name", "emailID");
    //     ID.setAttribute("placeholder", "E-Mail ID");

    //     // Create an input element for password
    //     var PWD = document.createElement("input");
    //     PWD.setAttribute("type", "password");
    //     PWD.setAttribute("name", "password");
    //     PWD.setAttribute("placeholder", "Password");

    //     // Create a submit button
    //     var s = document.createElement("input");
    //     s.setAttribute("type", "submit");
    //     s.setAttribute("value", "Submit");

    //     // Append the email_ID input to the form
    //     form.append(ID);
       
    //     // Append the password to the form
    //     form.append(PWD);
       
    //     // Append the button to the form
    //     form.append(s);

    //     document.getElementsByTagName("body")[0]
    //    .appendChild(form);

    //     // editorUiInit.showDialog(new OpenDialog(this).container, 320, 220, true, true, function () {
    //     //   window.openFile = null;
    //     // });
    //     // var result = window.showModalDialog("http://www.java2s.com", '<h1>Heading level 1</h1>', "dialogWidth:300px; dialogHeight:201px; center:yes");
    //     console.log(form.innerHTML);
    //     console.log("addAction Import");
    //   }
    // }, null, null, '');

    this.actions.addAction('save', function () {
      //console.log('save action desde indexJS');
      var answer = window.confirm('Estas seguro en guardar el diagrama?');
      if (answer) {
        //console.log('emitir el evento guardar');
        socket.emit('save_component', { room });
      }

    }, null, null, '');


    // Extends graphChangeListener to emit socket server

    var graphChangeListener = EditorUi.prototype.editor.graphChangeListener;

    EditorUi.prototype.editor.graphChangeListener = function (sender, eventObject) {
      graphChangeListener.apply(this, arguments);
      //console.log(event);
      if ((event && event.pointerType) || (event && event.key == 'Delete') || (event && event.key == 'Backspace')) {
        //console.log('is a pointer type...');
        const snapshotDiagramXml = EditorUi.prototype.editor.getGraphXml();
        const xmlString = (new XMLSerializer()).serializeToString(snapshotDiagramXml);
        socket.emit('draw_component', { room, xml: xmlString });
      }
    }

    this.footerContainer.style.textAlign = 'center';

    if (room && username) {
      socket.emit('login', { name: username, room });
    } else {
      if (room && !username) {
        this.footerContainer.innerHTML = '<strong>AVISO: ' + UserNotFound + ' no encontrado. MODO SOLITARIO</strong>';
      } else if (username && !room) {
        this.footerContainer.innerHTML = '<strong>AVISO: ' + RoomNotFound + ' no encontrado. MODO SOLITARIO</strong>';
      } else {
        this.footerContainer.innerHTML = '<strong>AVISO: ' + UserNotFound + ' y ' + RoomNotFound + ' no encontrados. MODO SOLITARIO</strong>';
      }

    }

  };


  // Extends itemClicked to emit socket server

  var itemClicked = EditorUi.prototype.sidebar.prototype.itemClicked;

  EditorUi.prototype.sidebar.prototype.itemClicked = function (cells, ds, evt, elt) {
    itemClicked.apply(this, arguments);
    //console.log('extends from itemClicked...');
    const snapshotDiagramXml = this.editorUi.editor.getGraphXml();
    const xmlString = (new XMLSerializer()).serializeToString(snapshotDiagramXml);
    socket.emit('draw_component', { room, xml: xmlString });
  }



  // Adds required resources (disables loading of fallback properties, this can only
  // be used if we know that all keys are defined in the language specific file)
  mxResources.loadDefaultBundle = false;

  var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
    mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

  // Fixes possible asynchronous requests
  mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
    // Adds bundle text to resources
    mxResources.parse(xhr[0].getText());

    // Configures the default graph theme
    var themes = new Object();
    themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

    // Main
    new EditorUi(new Editor(urlParams.chrome == '0', themes));
    //console.log(EditorUi.prototype.sidebarContainer);
    var users = document.createElement('a');
    users.className = 'geTitle';
    users.style = 'padding-left:7%'
    users.innerText = 'Usuarios Conectados';
    EditorUi.prototype.sidebarContainer.appendChild(users);

  }, function () {
    document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
  });






  // socket client
  socket.on('connect', () => {


    socket.on('draw_component', (data) => {
      //console.log('Listen to socketClient.drawComponent');
      const { xml: xmlString } = data;
      //console.log('xmlstring es ',xmlString);
      if (xmlString !== '') {
        EditorUi.prototype.editor.setGraphXml(window.parent.mxUtils.parseXml(xmlString).documentElement);

      }
    });

    socket.on('load_room_title', (data) => {
      var title = document.createElement('a');
      title.className = 'geTitle';
      title.innerHTML = '<center style="margin-right:10%;"><strong>' + data.title.trim().toUpperCase() + '</strong> </center>';
      EditorUi.prototype.sidebarContainer.insertBefore(title, EditorUi.prototype.sidebarContainer.firstChild);
    });

    socket.on('reload_users_room', (data) => {
      console.log('reload_users_room desde el socket cliente.')
      data.users.forEach(user => {
        let isDraw = true;
        // redraw users connects
        var children = EditorUi.prototype.sidebarContainer.children;
        for (let i = 0; i < children.length; i++) {
          if (user.id == children[i].id) {
            isDraw = false
          }

        };

        if (isDraw) {
          var client = document.createElement('div');
          client.className = 'geTitle';
          client.id = user.id;
          client.style = 'padding-left:13%'
          client.innerHTML = ' <i class="fa fa-user" style="margin-right:5%;" > </i>' + user.name;
          EditorUi.prototype.sidebarContainer.appendChild(client);
        }

      });



    });

    socket.on('error_server', () => {

      EditorUi.prototype.footerContainer.innerHTML = '<strong>AVISO: Error al traer datos del Servidor. MODO SOLITARIO</strong>';

    });


    socket.on('remove_user_room', (data) => {
      // redraw users connects
      //console.log('remove_user_room...');
      var children = EditorUi.prototype.sidebarContainer.children;
      for (let i = 0; i < children.length; i++) {
        const id = children[i].id;
        if (data.userToRemove.id == id) {
          children[i].remove();
        }

      };



    });

    socket.on('save_response', (data) => {

      alert(data.message);

    });








  })


});

