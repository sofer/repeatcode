
RC.topic = {
  
  importedExercises: [],
  addedExercises: 0,
  warning: '',
  rtl: true,
  name: '', 
  
  // if a response is not a number, then it's unlikely that responses should display rtl
  rtlCheck: function(text) {
    if (text.match(/[^.\d]/)) {
      this.rtl = false;
    }
  },
  
  replaceAwkwardCharacters: function(importedText) {
    importedText = importedText.replace('‘', "'");
    importedText = importedText.replace('’', "'");
    importedText = importedText.replace('’', "'");
    importedText = importedText.replace('“', '"');
    importedText = importedText.replace('”', '"');
    importedText = importedText.replace('…', "...");
    return importedText;
  },

  parse: function(importedText) {
    importedText = this.replaceAwkwardCharacters(importedText);
    this.importedExercises = [];
    var lines = importedText.split("\n");
    for (var i = 0; i < lines.length; i += 1) {
      if ( lines[i].match(/\w/) ) {
        var terms = lines[i].split("\t");
        var phrase = terms[0];
        var response = terms[1];
        var hint = terms[2];
        var notes = terms[3];
        if ( phrase && !response ) {
          if (i === 0) {
            this.name = phrase;
          } else {
            i += 1;
            this.warning = "Incomplete exercise on line " + i;
            return false;
          }
        } else {
          this.rtlCheck(response);
          this.importedExercises.push([phrase, response, hint ? hint : '', notes ? notes : '']);
        }
      }
    }
    if (this.importedExercises.length > 0) {
      this.warning = this.importedExercises.length + " exercises imported";
      return true;
    } else {
      this.warning = "Please enter some data";
      return false;
    }
  },
  
  addImportedData: function(location, template){
    if (this.importedExercises.length > 0) {
      $("#exercises").html('');
      for (var i = 0; i < this.importedExercises.length; i += 1) {
        $("#hidden-fields").append( $("#hidden-exercise-template").html() );
        $(".phrase:last", "#hidden-fields").val(this.importedExercises[i][0]);
        $(".response:last", "#hidden-fields").val(this.importedExercises[i][1]);
        $(".hint:last", "#hidden-fields").val(this.importedExercises[i][2]);
        $(".notes:last", "#hidden-fields").val(this.importedExercises[i][3]);
        var rowNo = i + 1;
        if (rowNo % 2 === 0) {
           var row = '<tr class="even">'
        } else {
          var row = "<tr>"
        }
        row +=  "<td>" + rowNo + "</td>" +
            "<td><div class=\"fixed-height\">" + this.importedExercises[i][0] + "</div></td>" +
            "<td><div class=\"fixed-height\">" + this.importedExercises[i][1] + "</div></td>" +
            "<td><div class=\"fixed-height\">" + this.importedExercises[i][2] + "</div></td>" +
            "<td><div class=\"fixed-height\">" + this.importedExercises[i][3] + "</div></td>" +
            "<td> </td>" +
            "</tr>"
        $("#exercises").append(row);
      }
    }
  },
  
  checkScratchTable: function(){
    this.addedExercises = $("#exercises > tr td.phrase input[value!='']").length;
  }
  
};

$(document).ready(function(){
  
  $("#choose-import").children("input:radio").click();
  $("#table").hide();
  $("#finally").hide();

  $("#add-exercise").click(function() {
    RC.table.appendRow();
  });

  $("#choose-import").click(function() {
    $("#table").hide();
    $("#topic-import").show();
    return false;
  });

  $("#choose-table").click(function() {
    $("#topic-import").hide();
    $("#navigation").hide();
    $("#table").show();
    RC.table.display();
    return false;
  });

  $("#import-data").focus(function() {
    if ($(this).hasClass("disabled")) {
      $(this).val("");
      $(this).removeClass("disabled");
    }
  });

  // click inside append-to-list to add list-item to list
  $("#add-item").click(function() {
    $("#list-template").children().clone().appendTo("#list");
    return false;
  });
  
  $("#parse-import-data").click(function(){
    if ( RC.topic.parse( $("#import-data").val() ) ) {
      RC.topic.addImportedData();
      RC.table.init('#exercises', 15);
      RC.table.display();
      $("#choose").hide();
      $("#topic-import").hide();
      $("#table").show();
      $("#navigation").show();
    }
    $(".warning").text(RC.topic.warning);
    return false;
  });
  
  $("#confirm").click(function(){
    RC.topic.checkScratchTable();
    if ((RC.topic.importedExercises.length > 0) || RC.topic.addedExercises > 0) {
      $("#exercise-count").text( RC.topic.importedExercises.length || RC.topic.addedExercises );
      if (!RC.topic.rtl) {
        $("#rtl").hide();
      }
      $("#firstly").hide();
      if (RC.topic.name !== '') {
        $('#topic_name').val(RC.topic.name);
        $(".warning").text("Check details");
      } else {
        $(".warning").text("Please add a topic name");
      }
      $("#finally").show();
    } else {
      $(".warning").text("Please add some exercises");
    }
    return false;
  });
  
  $("#continue-edit").click(function(){
    $("#firstly").hide();
    $("#finally").show();
    return false;
  });
  
  $("#topic_submit").click(function(){
    if ($("#topic_name").val() === '') {
      return false;
    }
  });
  
  $("#add-exercise").click(function() {
    
  });
  
});

