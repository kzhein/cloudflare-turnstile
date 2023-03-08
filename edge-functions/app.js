import 'https://deno.land/x/dotenv/load.ts';

export default async req => {
  try {
    const { cfTurnstileResponse, data } = await req.json();

    if (!data || !cfTurnstileResponse) {
      const error = new Error('No input data or token');
      error.status = 400;
      throw error;
    }

    // this will always return status 200
    const { success } = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: JSON.stringify({
          secret: Deno.env.get('TURNSTILE_SECRET_KEY'),
          response: cfTurnstileResponse,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(res => res.json());

    if (!success) {
      const error = new Error('Verification failed!');
      error.status = 401;
      throw error;
    }

    // then process the data such as putting it in db or something

    return new Response(
      JSON.stringify({ message: 'Data submitted successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: err.status || 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config = { path: '/app' };
