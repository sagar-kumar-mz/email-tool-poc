const editorTemplate = `<button id="session" class="button" style="color: ${theme.secondary};background-color:${theme.primary};">Add Booth</button>`;
const searchButton = `<button id="search-btn" class="button" style="width: 20%;color: ${theme.secondary};background-color:${theme.primary};">Search</button>`;
const speakerAndBoothList = function (values, isPreview) {
  if (values?.speakers?.length || values?.booths?.length || !values?.boothLibrary?.selected?.id) {
    console.log('values', values);
    console.log('values', console.log('values', values));
    if (isPreview) {
      return `
  <tr>
    <td>
      <p id="${values?.boothLibrary?.selected?.id}-sessionSpeaker">${
        !values?.boothLibrary?.selected?.id
          ? ['a', 's', 'd'].toString()
          : values?.speakers?.toString()
      }</p>
      <p id="${values?.boothLibrary?.selected?.id}-sessionBooth">${
        !values?.boothLibrary?.selected?.id
          ? ['q', 'w', 'e'].toString()
          : values?.booths?.toString()
      }</p>
    </td>
  </tr>
`;
    } else {
      return `
 <div>
  <p id="${values?.boothLibrary?.selected?.id}-sessionSpeaker">${
        !values?.boothLibrary?.selected?.id
          ? ['a', 's', 'd'].toString()
          : values?.speakers?.toString()
      }</p>
  <p id="${values?.boothLibrary?.selected?.id}-sessionBooth">${
        !values?.boothLibrary?.selected?.id
          ? ['q', 'w', 'e'].toString()
          : values?.booths?.toString()
      }</p>
 </div>
`;
    }
  } else {
    return ``;
  }
};

const boothItemsTemplate = _.template(`
<% _.forEach(sessions, function(item) { %>
  <div class="product-item" id="booth-item" data-uuid='<%= item.id %>' data-title="<%= item.name %>"  data-date-time="<%= item.dateAndTime %>" >
    <p style="color: ${theme.secondary};"><%= item.dateAndTime %></p>
    <h4 style="margin: 8px 0; text-align: left; color: ${theme.primary};"><%= item.name %></h4>
  </div>
<% }); %>
`);

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
            <input type="text" class="form-control" placeholder="Search by session name" id="search-bar" style="width: 78%" />
            ${searchButton}
          </div>
          <div class="products-list">
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
      ${values.isShowSpeakerAndBooth ? speakerAndBoothList(values) : ''}
    </div>
  </div>
  ${isViewer ? modalTemplate({ sessions: values.data.sessions }) : ''}`;
};

const toolEmailTemplate = function (values, isViewer = false) {
  return `
    <table sessionId="${
      values?.boothLibrary?.selected?.id ? values?.boothLibrary?.selected?.id : ''
    }" cellspacing="0" cellpadding="0" style="position:relative;min-width:0;word-wrap:break-word;background-color:#fff;background-clip:border-box;border:1px solid rgba(0,0,0,.125);border-radius:4px;margin:auto;text-align:center;">
      <tbody>
        <tr><td width="100%"><p id="${
          values?.boothLibrary?.selected?.id
        }-sessionDateAndTime" style="color:${values.sessionDateAndTimeColor};">
        ${values.dateAndTime ? values.dateAndTime : 'session date and time'}
      </p></td></tr>
        <tr><td width="100%"><h3 id="${
          values?.boothLibrary?.selected?.id
        }-sessionName" style="text-align: left;margin: 8px 0 12px 0; padding: 0 16px; color: ${
    values.sessionNameColor
  };">${values.sessionName ? values.sessionName : 'Session Name'}</h3></td></tr>
        <tr><td width="100%"><h3 id="${
          values?.boothLibrary?.selected?.id
        }-sessionSpeakerAndBooth" style="text-align: left;margin: 8px 0 12px 0; padding: 0 16px; color: ${
    values.sessionDescriptionColor
  };">${values.description ? values.description : 'Session description'}</h3></td></tr>
  ${values.isShowSpeakerAndBooth ? speakerAndBoothList(values, true) : ''}
      </tbody>
    </table>
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
      const addButton = node.querySelector('#session');
      addButton.onclick = function () {
        showModal();
        setTimeout(() => {
          // We are using event bubling to capture clicked item instead of registering click event on all product items.
          const selectButton = document.querySelector('.products-list');
          if (!selectButton) return;
          selectButton.onclick = function (e) {
            if (e.target.id === 'booth-item') {
              // If user clicks on product item
              // Find selected item from sessions list
              const selectedProduct = data.sessions.find(
                (item) => item.id === parseInt(e.target.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            } else {
              // If user click on child of product item (e.g. title, price, image or desctiption)
              const parent = e.target.parentElement;
              if (parent && parent.id !== 'booth-item') return;
              const selectedProduct = data.sessions.find(
                (item) => item.id === parseInt(parent.dataset.uuid)
              );
              updateValue({ selected: selectedProduct });
            }
            hideModal();
            // This is a hack to close property editor right bar on selecting an item from sessions list.
            const outerBody = document.querySelector('#u_body');
            outerBody.click();
          };
          /* Register event listeners for search */
          const searchBar = document.querySelector('#search-bar');
          const searchButton = document.querySelector('#search-btn');
          const closeBtn = document.querySelector('#modalCloseBtn');
          searchButton.onclick = function (e) {
            const list = document.querySelector('#booth_library_modal .products-list');
            let filteredItem;
            let boothListHtml;
            if (list && data && data.sessions) {
              if (searchBar.value === '') {
                boothListHtml = boothItemsTemplate({ sessions: data.sessions });
              } else {
                filteredItem = data.sessions.filter((item) =>
                  item.name.toLowerCase().includes(searchBar.value.toLowerCase())
                );
                boothListHtml = boothItemsTemplate({ sessions: filteredItem });
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
  name: 'session_tool',
  label: 'Session',
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
        isShowSpeakerAndBooth: {
          label: 'Show Speaker And Booth',
          defaultValue: true,
          widget: 'toggle',
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
            sessionName: value?.selected?.name,
            dateAndTime: value?.selected?.dateAndTime,
            description: value?.selected?.description,
            speakers: value?.selected?.speakers,
            booths: value?.selected?.booths,
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
