function addCheckbox(ROI_LIST_Array) {
    ROI_LIST_Array.forEach(function (n) {
        let ul = document.getElementById('ul');
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n.x30060022;
        checkbox.name = 'roi';
        checkbox.class = 'roiSet';

        li.append(checkbox);

        let text = n.x30060026;
        li.append(document.createTextNode(text));
        ul.append(li);
    });

}
export default addCheckbox;
