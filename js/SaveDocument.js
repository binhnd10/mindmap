/**
* Creates a new SaveDocumentView. This view renders a dialog where the user can
* save the mind map.
*
* @constructor
*/
mindmaps.SaveDocumentView = function() {
  var self = this;

  var $dialog = $("#template-save").tmpl().dialog({
    autoOpen : false,
    modal : true,
    zIndex : 5000,
    width : 550,
    close : function() {
      // remove dialog from DOM
      $(this).dialog("destroy");
      $(this).remove();
    }
  });


  var $saveCloudStorageButton = $("#button-save-cloudstorage").button().click(
    function() {
      if (self.cloudStorageButtonClicked) {
        self.cloudStorageButtonClicked();
      }
    });

  var $localSorageButton = $("#button-save-localstorage").button().click(
    function() {
      if (self.localStorageButtonClicked) {
        self.localStorageButtonClicked();
      }
    });

  var $databaseButton = $("#button-save-database").button().click(
    function() {
      if (self.databaseButtonClicked) {
        self.databaseButtonClicked();
      }
    });

  var $autoSaveCheckbox = $("#checkbox-autosave-localstorage").click(
    function() {
      if (self.autoSaveCheckboxClicked) {
        self.autoSaveCheckboxClicked($(this).prop("checked"));
      }
    });

  var $hddSaveButton = $("#button-save-hdd").button().click(
    function () {
      if (self.hddSaveButtonClicked) {
        self.hddSaveButtonClicked();
      }
    });

  this.setAutoSaveCheckboxState = function(checked) {
    $autoSaveCheckbox.prop("checked", checked);
  };

  this.showSaveDialog = function() {
    $dialog.dialog("open");
  };

  this.hideSaveDialog = function() {
    $dialog.dialog("close");
  };

  this.showCloudError = function(msg) {
    $dialog.find('.cloud-error').text(msg);
  }
};

/**
* Creates a new SaveDocumentPresenter. The presenter can store documents in the
* local storage or to a hard disk.
*
* @constructor
* @param {mindmaps.EventBus} eventBus
* @param {mindmaps.MindMapModel} mindmapModel
* @param {mindmaps.SaveDocumentView} view
* @param {mindmaps.AutoSaveController} autosaveController
* @param {mindmaps.FilePicker} filePicker
*/
mindmaps.SaveDocumentPresenter = function(eventBus, mindmapModel, view, autosaveController, filePicker) {

  /**
  * Save in cloud button was clicked.
  */
  view.cloudStorageButtonClicked = function() {
    mindmaps.Util.trackEvent("Clicks", "cloud-save");

    filePicker.save({
      success: function() {
        view.hideSaveDialog();
      },
      error: function(msg) {
        view.showCloudError(msg);
      }
    });
  };

  /**
  * View callback when local storage button was clicked. Saves the document
  * in the local storage.
  *
  * @ignore
  */
  view.localStorageButtonClicked = function() {
    mindmaps.Util.trackEvent("Clicks", "localstorage-save");

    var success = mindmapModel.saveToLocalStorage();
    if (success) {
      view.hideSaveDialog();
    } else {
      eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR, "Error while saving to local storage");
    }
  };

  view.databaseButtonClicked = function() {
    mindmaps.Util.trackEvent("Clicks", "database-save");

    mindmapModel.saveToDatabase(function (err, data) {
      if (!err) {
        view.hideSaveDialog();
      } else {
        eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR, "Error while saving to database");
      }
    });
  };


  /**
  * View callback: Enables or disables the autosave function for localstorage.
  *
  * @ignore
  */
  view.autoSaveCheckboxClicked = function(checked) {
    if (checked) {
      autosaveController.enable();
    } else {
      autosaveController.disable();
    }
  };

  view.hddSaveButtonClicked = function() {
    mindmaps.Util.trackEvent("Clicks", "hdd-save");

    var filename = mindmapModel.getMindMap().getRoot().getCaption() + ".json";
    var content = mindmapModel.getDocument().prepareSave().serialize();
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    window.saveAs(blob, filename);

    var doc = mindmapModel.getDocument();
    eventBus.publish(mindmaps.Event.DOCUMENT_SAVED, doc);
    view.hideSaveDialog();
  };

  this.go = function() {
    view.setAutoSaveCheckboxState(autosaveController.isEnabled());
    view.showSaveDialog();
  };
};
