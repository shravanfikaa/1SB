
export function populateNomineesDropdown(nomineeData) {
  const nominee = [];
  nomineeData.forEach((value) => {
    nominee.push({
      id: value.id,
      title: value.nominee_first_name
    })
  });
  nominee.sort((nominee1, nominee2) => (nominee1.title > nominee2.title) ?
    1 : ((nominee2.title > nominee1.title) ? -1 : 0));
  return nominee;
}
