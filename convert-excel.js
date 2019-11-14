function makeGReport() {
	//get current date for naming daily folder & files in main temp
	var currentDate = new Date();
	var currentDay = currentDate.getDate().toString();
	var currentMonth = (currentDate.getMonth() + 1).toString();
	var currentYear = currentDate.getFullYear().toString();
	var cvtToday = currentYear + currentMonth + currentDay;

	//create daily folder in main temp
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var readme = ss.getSheetByName('Guideline/ Readme');
	var gRreportTempId = readme.getRange('I1').getValue();
	var cvtFolder = DriveApp.getFolderById(gRreportTempId);
	var cvtDailyFolder = cvtFolder.createFolder(cvtToday + '_G-report');
	var cvtDailyFolderId = cvtDailyFolder.getId();

	//load G-report template and read Excel download files
	var ssId = ss.getId();
	var ssFile = DriveApp.getFileById(ssId);
	var folder = ssFile.getParents().next();
	var folderId = folder.getId();
	var files = folder.getFiles();

	//create copied Gsheet of Excel downloaded files
	while (files.hasNext()) {
		var file = files.next();
		Logger.log(file);
		var name = file.getName();
		Logger.log(name);
		if (name != 'Copy of G-Report template') {
			var iD = file.getId();
			Logger.log(iD);
			var xBlob = file.getBlob();
			Logger.log(xBlob);
			var newFile = {
				title: cvtToday + '_' + name + '_converted',
				parents: [{ kind: 'drive#parentReference', id: cvtDailyFolderId }],
			};
			Logger.log(newFile);
			var newGsheetCvt = Drive.Files.insert(newFile, xBlob, {
				convert: true,
			});
		}
	}

	//start using DriveApp from here to load converted Gsheet to arrays
	Utilities.sleep(30000);
	var cvtFiles = cvtDailyFolder.getFiles();

	while (cvtFiles.hasNext()) {
		var cvtFile = cvtFiles.next();
		var cvtFileId = cvtFile.getId();
		var cvtFileName = cvtFile.getName();
		var cvtFileNameSplit = cvtFileName.split('_');
		var cvtFileNameFinalArr = cvtFileNameSplit[1].split('.');
		var cvtFileNameFinal = cvtFileNameFinalArr[0];
		var newSs = SpreadsheetApp.openById(cvtFileId);
		var newSsS = newSs.getActiveSheet();
		var SsSData = newSsS.getRange(1, 1, newSsS.getLastRow(), newSsS.getLastColumn()).getValues();
		var newSheet = ss.insertSheet(cvtFileNameFinal);
		newSheet.getRange(1, 1, newSsS.getLastRow(), newSsS.getLastColumn()).setValues(SsSData);
	}
}
