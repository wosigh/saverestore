function SaveAssistant() {
    this.boundFunctions = new Array();
    this.boundFunctions['saveApps'] = this.saveApps.bindAsEventListener(this);
    this.boundFunctions['processCallback'] = this.processCallback.bind(this);
    this.processAppsList = [];
    this.toggleOn = false;
}

SaveAssistant.prototype.setup = function() {
    // initialize our list
    this.appListAttr = { itemTemplate: "app-list/row-template-toggle" };//, dividerTemplate: "media-list/divider", dividerFunction: this.boundFunctions['dividerFunc']
    this.appListModel = { items: [] };
    this.controller.setupWidget( "appList", this.appListAttr, this.appListModel );
    this.controller.setupWidget( "appToggleButton", { modelProperty: 'checked', trueLabel: 'on', falseLabel: 'off' } );
	
    // new buttons
    this.buttonsAttributes = { spacerHeight: 50, menuClass: 'no-fade' };
    this.buttonsModel = {
	visible: true,
	items: [
    { label: "Select None", command: "toggleChecked" },
    { label: "Save Selected", command: "doSave" }
		]
    }
    this.controller.setupWidget( Mojo.Menu.commandMenu, this.buttonsAttributes, this.buttonsModel );


    // load up
    this.loadList();
};

SaveAssistant.prototype.loadList = function() {
    var apps = appDB.appsAvailable;
    for (var i = 0; i < apps.length; i++) {
	var app = appDB.appsInformation[apps[i]];
	this.appListModel.items.push( { appname: app.title, appid: app.id, timestamp: Mojo.Format.formatDate(ISO8601Parse(app.timestamp),"long"), summary: app.note, checked: true } );
    }
    this.controller.modelChanged( this.appListModel );
};

SaveAssistant.prototype.saveApps = function(event) {
    for (var i = 0; i < this.appListModel.items.length; i++) {
	var thisobj = this.appListModel.items[i];
	if (thisobj.checked) this.processAppsList.push( thisobj );
    }
	
    this.processApps();
};

SaveAssistant.prototype.processApps = function() {
    if (this.processAppsList.length < 1) {
	this.buttonsModel.items[0].label = "Select All";
	this.controller.modelChanged( this.buttonsModel );
	this.toggleOn = true;
	return;
    }
    var item = this.processAppsList.shift();
    Mojo.Log.info( "Saving " + item.appid );
    SaveRestoreService.save( this.processCallback.bindAsEventListener(this, item), item.appid );
};

SaveAssistant.prototype.processCallback = function(e, item) {
    if (e.returnValue == true) {
	if (e.output && e.output.length > 0) {
	    item.summary = e.output.join("\n");
	}
	item.checked = false;
	this.controller.modelChanged( this.appListModel );
	this.processApps();
    }
    else dumpObject(e);
};

SaveAssistant.prototype.handleCommand = function (event) {

    if (event.type === Mojo.Event.command) {
        if (event.command == 'toggleChecked') {
            Mojo.Log.info( "toggling" );
			
	    // loop the items
	    for (var i = 0; i < this.appListModel.items.length; i++) {
		var thisobj = this.appListModel.items[i];
		thisobj.checked = this.toggleOn;
	    }
	    this.controller.modelChanged( this.appListModel );
			
	    // switch it up
	    this.buttonsModel.items[0].label = this.toggleOn ? "Select None" : "Select All";
	    Mojo.Log.info( "label: " + this.buttonsModel.items[0].label );
	    this.controller.modelChanged( this.buttonsModel );
	    this.toggleOn = !this.toggleOn;
        }
	else if (event.command == 'doSave') {
            Mojo.Log.info( "saving" );
	    this.saveApps();
        }
    }
};

SaveAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
};

SaveAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

SaveAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};
