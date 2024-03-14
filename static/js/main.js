let gridApi;
let lastSelected;

const columnDefs = [
    {headerName: "id", field: "id", width: 150, editable:false},
    {headerName: "First Name", field: "first_name", width: 90, filter: 'agNumberColumnFilter'},
    {headerName: "Last Name", field: "last_name", width: 120},
    {headerName: "Email", field: "email", width: 90},
    {
        headerName: "Gender", 
        field: "gender", 
        width: 145, 
        filter:'agDateColumnFilter', 
        cellEditor: 'agSelectCellEditor',
        cellEditorParams:{
            values: ['Male', 'Female']
        }},
    {headerName: 'IP address', field: 'ip_address', width: 100},
    {headerName: 'Editable', field: 'editable', width: 100}];

const gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100,
        // make every column editable
        editable: true,
        resizable: true,
        filter: 'agTextColumnFilter'
    },
    editType: 'fullRow',
    rowSelection: 'single',
    onRowValueChanged: function(event) {
        var data = event.data;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(event) {
            if (this.readyState == 4 && this.status == 200) {
              console.log(event.target.responseText);
            }
          };
        xhttp.open('POST', '/post_data', true);
        xhttp.setRequestHeader("Content-type", 'application/json;charset=UTF-8"');
        xhttp.send(JSON.stringify(data));
    },
    onRowSelected: function(event) {
        if (event.node.isSelected()) {
            let data = event.data;
            document.getElementById("gridMessage").innerHTML="Selected row " + data.id;
            lastSelected = data.id;
        }            
        else {
            if (lastSelected == event.data.id)
                document.getElementById("gridMessage").innerHTML="";
        }
            
    }

};

document.addEventListener("DOMContentLoaded", function() {
    // console.log('hello');
    var gridDiv = document.querySelector('#myGrid');
    gridApi = agGrid.createGrid(gridDiv, gridOptions);

    fetch('/get_data').then((data) => data.json()).then( function(data) {
        // console.log(data);
        data = JSON.parse(data);
        //console.log(data);
        //gridOptions.api.setRowData(data);
        //gridApi.setRowData(data);
        gridApi.updateGridOptions({ rowData: data });
    });
});

function addRow() {
    const data = gridApi.getGridOption("rowData");
    const lastIdx = data[data.length-1].id;
    data.push({id: lastIdx+1});
    gridApi.updateGridOptions({ rowData: data }); 
    //gridApi.applyTransaction({add: [{id: lastIdx+1}]});
};

function deleteRow() {
    const newData = [];
    const data = gridApi.getGridOption("rowData");
    const selectedData = gridApi.getSelectedRows();
    let selectedIndex;
    let record;
    if (selectedData.length > 0)
        selectedIndex = selectedData[0].id;
    for (let rowKey in data) {
        if (data[rowKey].id != selectedIndex)
            newData.push(data[rowKey]);
        else
            record = data[rowKey];
    }
    gridApi.updateGridOptions({ rowData: newData }); 

    //call the rest api to delete the row in db
    if (record != undefined)
    {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(event) {
            if (this.readyState == 4 && this.status == 200) {
              console.log(event.target.responseText);
            }
          };
        xhttp.open('POST', '/delete_row', true);
        xhttp.setRequestHeader("Content-type", 'application/json;charset=UTF-8"');
        xhttp.send(JSON.stringify(record));        
    }

}