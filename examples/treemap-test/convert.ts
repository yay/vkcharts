export const rowData = [
  { orgHierarchy: ['Erica Rogers'], jobTitle: 'CEO', employmentType: 'Permanent' },
  { orgHierarchy: ['Erica Rogers', 'Malcolm Barrett'], jobTitle: 'Exec. Vice President', employmentType: 'Permanent' },

  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker'],
    jobTitle: 'Director of Operations',
    employmentType: 'Permanent',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson'],
    jobTitle: 'Fleet Coordinator',
    employmentType: 'Permanent',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson', 'Leah Flowers'],
    jobTitle: 'Parts Technician',
    employmentType: 'Contract',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson', 'Tammy Sutton'],
    jobTitle: 'Service Technician',
    employmentType: 'Contract',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Derek Paul'],
    jobTitle: 'Inventory Control',
    employmentType: 'Permanent',
  },

  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland'],
    jobTitle: 'VP Sales',
    employmentType: 'Permanent',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Morris Hanson'],
    jobTitle: 'Sales Manager',
    employmentType: 'Permanent',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Todd Tyler'],
    jobTitle: 'Sales Executive',
    employmentType: 'Contract',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Bennie Wise'],
    jobTitle: 'Sales Executive',
    employmentType: 'Contract',
  },
  {
    orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Joel Cooper'],
    jobTitle: 'Sales Executive',
    employmentType: 'Permanent',
  },
];

export function convertGridTreeData(_data: any): any {
  const root: any = {};

  rowData.forEach((row) => {
    insert(root, row, 'orgHierarchy');
  });

  return root;
}

function insert(root: any, row: any, pathFieldName: string) {
  const pathParts = row[pathFieldName] as string[];
  const lastPartIndex = pathParts.length - 1;

  pathParts.forEach((pathPart, partIndex) => {
    let children = root.children;
    if (!children) {
      root.children = children = [] as any[];
    }
    root = children.find((child: any) => {
      return child[pathFieldName] === pathPart;
    });
    if (!root) {
      if (partIndex === lastPartIndex) {
        children.push({
          ...row,
          [pathFieldName]: pathPart,
        });
      } else {
        // create an intermediate node
        root = {
          [pathFieldName]: pathPart,
        };
        children.push(root);
      }
    }
  });
}
