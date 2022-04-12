const editorTemplate = `<button id="booth" class="button" style="color: ${theme.secondary};background-color:${theme.primary};">Add Session</button>`;
const searchButton = `<button id="search-btn" class="button" style="width: 20%;color: ${theme.secondary};background-color:${theme.primary};">Search</button>`;
const sessionItemsTemplate = _.template(`
<% _.forEach(session, function(item) { %>
  <div class="product-item" id="session-item" data-uuid='<%= item.id %>' data-title="<%= item.name %>"  data-date-time="<%= item.dateAndTime %>" >
    <p style="color: ${theme.secondary};"><%= item.dateAndTime %></p>
    <h4 style="margin: 8px 0; text-align: left; color: ${theme.primary};"><%= item.name %></h4>
  </div>
<% }); %>
`);

const modalTemplate = function (data) {
  return `
  <div class="modal" id="session_library_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Session List</h3>
          <button class="close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-box">
            <input type="text" class="form-control" placeholder="Search by session name" id="search-bar" style="width: 78%" />
            ${searchButton}
          </div>
          <div class="products-list">
            ${sessionItemsTemplate(data)}
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
  return `<div class="product-card" style="position:relative;display:table;min-width:0;word-wrap:break-word;background-color:#fff;background-clip:border-box;border:1px solid rgba(0,0,0,.125);border-radius:4px;margin:auto;text-align:center;">
    <div class="product-card-body" style="padding: 0 16px 16px;text-align: left;">
      <p style="color:${values.sessionDateAndTimeColor};">
        ${values.dateAndTime ? values.dateAndTime : 'session date and time'}
      </p>
      <h3 style="margin: 12px 0; color: ${values.sessionNameColor};">${
    values.sessionName ? values.sessionName : 'Session Name'
  }</h3>
  <p style="color:${values.sessionDescriptionColor};">
        ${values.description ? values.description : 'session description'}
      </p>
    </div>
  </div>
  ${isViewer ? modalTemplate({ session: values.data.session }) : ''}`;
};

const toolEmailTemplate = function (values, isViewer = false) {
  return `
    <table sessionId="${
      values?.sessionLibrary?.selected?.id ? values?.sessionLibrary?.selected?.id : ''
    }" cellspacing="0" cellpadding="0" style="position:relative;min-width:0;word-wrap:break-word;background-color:#fff;background-clip:border-box;border:1px solid rgba(0,0,0,.125);border-radius:4px;margin:auto;text-align:center;">
      <tbody>
        <tr><td width="100%"><p id="${
          values?.sessionLibrary?.selected?.id
        }-sessionDateAndTime" style="color:${values.sessionDateAndTimeColor};">
        ${values.dateAndTime ? values.dateAndTime : 'session date and time'}
      </p></td></tr>
        <tr><td width="100%"><h3 id="${
          values?.sessionLibrary?.selected?.id
        }-sessionName" style="text-align: left;margin: 8px 0 12px 0; padding: 0 16px; color: ${
    values.sessionNameColor
  };">${values.sessionName ? values.sessionName : 'Session Name'}</h3></td></tr>
        <tr><td width="100%"><h3 id="${
          values?.sessionLibrary?.selected?.id
        }-sessionDescription" style="text-align: left;margin: 8px 0 12px 0; padding: 0 16px; color: ${
    values.sessionDescriptionColor
  };">${values.description ? values.description : 'Session description'}</h3></td></tr>
      </tbody>
    </table>
  `;
};

const showModal = function () {
  const modal = document.getElementById('session_library_modal');
  modal.classList.add('show');
};

const hideModal = function () {
  const modal = document.getElementById('session_library_modal');
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
          const selectButton = document.querySelector('.products-list');
          if (!selectButton) return;
          selectButton.onclick = function (e) {
            if (e.target.id === 'session-item') {
              // If user clicks on product item
              // Find selected item from session list
              const selectedProduct = data.session.find(
                (item) => item.id === parseInt(e.target.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            } else {
              // If user click on child of product item (e.g. title, price, image or desctiption)
              const parent = e.target.parentElement;
              if (parent && parent.id !== 'session-item') return;
              const selectedProduct = data.session.find(
                (item) => item.id === parseInt(parent.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            }
            hideModal();
            // This is a hack to close property editor right bar on selecting an item from session list.
            const outerBody = document.querySelector('#u_body');
            outerBody.click();
          };
          /* Register event listeners for search */
          const searchBar = document.querySelector('#search-bar');
          const searchButton = document.querySelector('#search-btn');
          const closeBtn = document.querySelector('#modalCloseBtn');
          searchButton.onclick = function (e) {
            const list = document.querySelector('#session_library_modal .products-list');
            let filteredItem;
            let boothListHtml;
            if (list && data && data.session) {
              if (searchBar.value === '') {
                boothListHtml = sessionItemsTemplate({ session: data.session });
              } else {
                filteredItem = data.session.filter((item) =>
                  item.name.toLowerCase().includes(searchBar.value.toLowerCase())
                );
                boothListHtml = sessionItemsTemplate({ session: filteredItem });
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
        sessionLibrary: {
          label: 'Add Booth from store',
          defaultValue: '',
          widget: 'booth_library',
        },
        sessionNameColor: {
          label: 'Session Name Color',
          defaultValue: theme?.primary,
          widget: 'color_picker',
        },
        sessionDateAndTimeColor: {
          label: 'Session Date And Time Color',
          defaultValue: theme?.secondary,
          widget: 'color_picker',
        },
        sessionDescriptionColor: {
          label: 'Session Description Color',
          defaultValue: theme?.secondary,
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
      name === 'sessionLibrary'
        ? {
            ...values,
            sessionName: value?.selected?.name,
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
        return toolTemplate(values, true);
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
