import ldapts from "ldapts";

async function importLDIF(url,file)
{
  const client = new ldapts.Client({ url });
  await client.bind(query.bindDN, query.password);
  await this.client.unbind();
}

