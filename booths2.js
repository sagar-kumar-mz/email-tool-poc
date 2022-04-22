const editorTemplate = `<button id="booth" class="button">Add Booth</button>`;
const searchButton = `<button id="search-btn" class="button">Search</button>`;
const boothItemsTemplate = _.template(`<% _.forEach(booths, function(item) { %>
  <div class="booth-item" id="booth-item" data-uuid='<%= item.id %>' data-title="<%= item.name %>"  data-image="<%= item.profile_img %>" style="background-color: ${theme.primaryColor};">
  <div class="booth-media"> <img src="<%= item.profile_img %>" style="max-height: 90px;width: 100%; object-fit: contain;border-radius:8px" /> </div>
  <h4 style="margin: 8px 0; text-align: center; color: ${theme.primaryFontColor};overflow: hidden;  display: block;  text-overflow: ellipsis;  white-space: nowrap;"><%= item.name %> </h4>
  </div>
<% }); %>`);

const modalTemplate = function (data) {
  return `
  <div class="modal" id="booth_library_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Booth List</h3>
          <button class="close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-box">
            <input type="text" class="form-control" placeholder="Search by booth name" id="search-bar" style="width: 100%" />
            ${searchButton}
          </div>
          <div class="booths-list">
            ${boothItemsTemplate(data)}
          </div>
        </div>
        <div class="modal-footer">
        </div>
      </div>
    </div>
  </div>
`;
};

const toolTemplate = function (values, isViewer = false) {
  return `<div class="booth-card card" style="position:relative;background-color:${values.boothBGColor}">
    <div class="booth-img"> <img src="${
      values?.boothImage?.url
        ? values?.boothImage?.url
        : 'https://cdn.v2dev.demohubilo.com/comm_v2/images/profile/exhibitor_default.png'
    }" style="width: 100%; object-fit: contain; border-radius:8px" />
    </div>
    <div class="booth-card-body" style="text-align: center;">
    <h3 style="margin:10px 10px 0; font-size:13px; color: ${values.boothNameColor};overflow: hidden;  display: block;  text-overflow: ellipsis;  white-space: nowrap;">${values.boothName ? values.boothName : 'Booth Name'}</h3>
    </div>
  </div>
  ${isViewer ? modalTemplate({ booths: values.data.booths }) : ''}`;
};

const toolEmailTemplate = function (values, isViewer = false) {
  return `
  <div style="position:relative;background-color:${values.boothBGColor};margin-bottom: 15px;min-height: 140px; padding: 1rem; border-radius: 8px;">
    <div style="border-radius: .8rem; border: 1px solid #f1f1f1;height: 85px;width: 85px;margin: auto; display: flex;background-color: #fff;"> <img src="${
      values?.boothImage?.url
        ? values?.boothImage?.url
        : 'https://cdn.v2dev.demohubilo.com/comm_v2/images/profile/exhibitor_default.png'
    }" style="width: 100%; object-fit: contain;border-radius:8px" />
    </div>
    <div style="text-align: center;">
    <h3 style="margin:10px 10px 0; font-size:13px; color: ${values.boothNameColor};overflow: hidden;  display: block;  text-overflow: ellipsis;  white-space: nowrap;">${values.boothName ? values.boothName : 'Booth Name'}</h3>
    </div>
  </div>
  `;
};

const showModal = function () {
  const modal = document.getElementById('booth_library_modal');
  modal.classList.add('show');
};

const hideModal = function () {
  const modal = document.getElementById('booth_library_modal');
  modal.classList.remove('show');
};

unlayer.registerPropertyEditor({
  name: 'booth_library',
  layout: 'bottom',
  Widget: unlayer.createWidget({
    render(value, updateValue, data) {
      return editorTemplate;
    },
    mount(node, value, updateValue, data) {
      const addButton = node.querySelector('#booth');
      addButton.onclick = function () {
        showModal();
        setTimeout(() => {
          // We are using event bubling to capture clicked item instead of registering click event on all product items.
          const selectButton = document.querySelector('.booths-list');
          if (!selectButton) return;
          selectButton.onclick = function (e) {
            if (e.target.id === 'booth-item') {
              // If user clicks on product item
              // Find selected item from booths list
              const selectedProduct = data.booths.find(
                (item) => item.id === parseInt(e.target.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            } else {
              // If user click on child of product item (e.g. title, price, image or desctiption)
              const parent = e.target.parentElement;
              if (parent && parent.id !== 'booth-item') return;
              const selectedProduct = data.booths.find(
                (item) => item.id === parseInt(parent.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            }
            hideModal();
            // This is a hack to close property editor right bar on selecting an item from booths list.
            const outerBody = document.querySelector('#u_body');
            outerBody.click();
          };
          /* Register event listeners for search */
          const searchBar = document.querySelector('#search-bar');
          const searchButton = document.querySelector('#search-btn');
          const closeBtn = document.querySelector('#modalCloseBtn');
          searchButton.onclick = function (e) {
            const list = document.querySelector('#booth_library_modal .booths-list');
            let filteredItem;
            let boothListHtml;
            if (list && data && data.booths) {
              if (searchBar.value === '') {
                boothListHtml = boothItemsTemplate({ booths: data.booths });
              } else {
                filteredItem = data.booths.filter((item) =>
                  item.name.toLowerCase().includes(searchBar.value.toLowerCase())
                );
                boothListHtml = boothItemsTemplate({ booths: filteredItem });
              }
              list.innerHTML = boothListHtml;
            }
          };
          closeBtn.onclick = hideModal;
        }, 200);
      };
    },
  }),
});

unlayer.registerTool({
  name: 'booth_tool',
  label: 'Booth',
  icon: 'fa-suitcase',
  supportedDisplayModes: ['web', 'email'],
  options: {
    boothContent: {
      title: 'Booth Content',
      position: 1,
      options: {
        boothLibrary: {
          label: 'Add Booth from store',
          defaultValue: '',
          widget: 'booth_library',
        },
        boothBGColor: {
          label: 'Booth BG Color',
          defaultValue: theme?.primaryColor,
          widget: 'color_picker',
        },
        boothNameColor: {
          label: 'Booth Name Color',
          defaultValue: theme?.primaryFontColor,
          widget: 'color_picker',
        },
      },
    },
  },
  transformer: (values, source) => {
    const { name, value, data } = source;
    // Transform the values here
    // We will update selected values in property editor here
    const newValues =
      name === 'boothLibrary'
        ? {
            ...values,
            boothName: value?.selected?.name,
            boothImage: {
              url: value?.selected?.profile_img,
            },
          }
        : {
            ...values,
          };

    // Return updated values
    return newValues;
  },
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `<div class="booths-list"> ${toolTemplate(values, true)} </div>`
      },
    }),
    exporters: {
      web(values) {
        return toolTemplate(values);
      },
      email(values) {
        return toolEmailTemplate(values);
      },
    },
    head: {
      css(values) {},
      js(values) {},
    },
  },
});
