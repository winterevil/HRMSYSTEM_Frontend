import React from 'react';

export default function PageTop() {
    return (
        <div id="page_top" className="section-body top_dark sticky-top">
            <div className="container-fluid">
                <div className="page-header">
                    <div className="left">
                        <h1 className="page-title">HR Dashboard</h1>
                    </div>
                    <div className="right">
                        <ul className="nav nav-pills">
                            {/*<li className="nav-item dropdown">*/}
                            {/*    <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Language</a>*/}
                            {/*    <div className="dropdown-menu">*/}
                            {/*        <a className="dropdown-item" href="#"><img className="w20 mr-2" src="https://puffintheme.com/template/epic-pro/assets/images/flags/us.svg"/>English</a>*/}
                            {/*    </div>*/}
                            {/*</li>*/}
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Reports</a>
                                <div className="dropdown-menu">
                                    <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-excel"></i> MS Excel</a>
                                    <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-word"></i> MS Word</a>
                                    <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-pdf"></i> PDF</a>
                                </div>
                            </li>
                        </ul>
                        <div className="notification d-flex">
                            {/*<div className="dropdown d-flex">*/}
                            {/*    <a className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1" data-toggle="dropdown">*/}
                            {/*        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-mail"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" /></svg>*/}
                            {/*        <span className="badge badge-success nav-unread"></span>*/}
                            {/*    </a>*/}
                            {/*    <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">*/}
                            {/*        <ul className="right_chat list-unstyled w250 p-0">*/}
                            {/*            <li className="online">*/}
                            {/*                <a href="javascript:void(0);">*/}
                            {/*                    <div className="media">*/}
                            {/*                        <img className="media-object " src="/assets/images/xs/avatar4.jpg" alt=""/>*/}
                            {/*                            <div className="media-body">*/}
                            {/*                                <span className="name">Donald Gardner</span>*/}
                            {/*                                <span className="message">Designer, Blogger</span>*/}
                            {/*                                <span className="badge badge-outline status"></span>*/}
                            {/*                            </div>*/}
                            {/*                    </div>*/}
                            {/*                </a>*/}
                            {/*            </li>*/}
                            {/*            <li className="online">*/}
                            {/*                <a href="javascript:void(0);">*/}
                            {/*                    <div className="media">*/}
                            {/*                        <img className="media-object " src="/assets/images/xs/avatar5.jpg" alt=""/>*/}
                            {/*                            <div className="media-body">*/}
                            {/*                                <span className="name">Wendy Keen</span>*/}
                            {/*                                <span className="message">Java Developer</span>*/}
                            {/*                                <span className="badge badge-outline status"></span>*/}
                            {/*                            </div>*/}
                            {/*                    </div>*/}
                            {/*                </a>*/}
                            {/*            </li>*/}
                            {/*            <li className="offline">*/}
                            {/*                <a href="javascript:void(0);">*/}
                            {/*                    <div className="media">*/}
                            {/*                        <img className="media-object " src="/assets/images/xs/avatar2.jpg" alt=""/>*/}
                            {/*                            <div className="media-body">*/}
                            {/*                                <span className="name">Matt Rosales</span>*/}
                            {/*                                <span className="message">CEO, Epic Theme</span>*/}
                            {/*                                <span className="badge badge-outline status"></span>*/}
                            {/*                            </div>*/}
                            {/*                    </div>*/}
                            {/*                </a>*/}
                            {/*            </li>*/}
                            {/*            <li className="online">*/}
                            {/*                <a href="javascript:void(0);">*/}
                            {/*                    <div className="media">*/}
                            {/*                        <img className="media-object " src="/assets/images/xs/avatar3.jpg" alt=""/>*/}
                            {/*                            <div className="media-body">*/}
                            {/*                                <span className="name">Phillip Smith</span>*/}
                            {/*                                <span className="message">Writter, Mag Editor</span>*/}
                            {/*                                <span className="badge badge-outline status"></span>*/}
                            {/*                            </div>*/}
                            {/*                    </div>*/}
                            {/*                </a>*/}
                            {/*            </li>*/}
                            {/*        </ul>*/}
                            {/*        <div className="dropdown-divider"></div>*/}
                            {/*        <a href="javascript:void(0)" className="dropdown-item text-center text-muted-dark readall">Mark all as read</a>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div className="dropdown d-flex">
                                <a className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1" data-toggle="dropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
                                    <span className="badge badge-primary nav-unread"></span>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                    <ul className="list-unstyled feeds_widget">
                                        <li>
                                            <div className="feeds-left"><i className="fa fa-check"></i></div>
                                            <div className="feeds-body">
                                                <h4 className="title text-danger">Issue Fixed <small className="float-right text-muted">11:05</small></h4>
                                                <small>WE have fix all Design bug with Responsive</small>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="feeds-left"><i className="fa fa-user"></i></div>
                                            <div className="feeds-body">
                                                <h4 className="title">New User <small className="float-right text-muted">10:45</small></h4>
                                                <small>I feel great! Thanks team</small>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="feeds-left"><i className="fa fa-thumbs-up"></i></div>
                                            <div className="feeds-body">
                                                <h4 className="title">7 New Feedback <small className="float-right text-muted">Today</small></h4>
                                                <small>It will give a smart finishing to your site</small>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="feeds-left"><i className="fa fa-question-circle"></i></div>
                                            <div className="feeds-body">
                                                <h4 className="title text-warning">Server Warning <small className="float-right text-muted">10:50</small></h4>
                                                <small>Your connection is not private</small>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="feeds-left"><i className="fa fa-shopping-cart"></i></div>
                                            <div className="feeds-body">
                                                <h4 className="title">7 New Orders <small className="float-right text-muted">11:35</small></h4>
                                                <small>You received a new oder from Tina.</small>
                                            </div>
                                        </li>
                                    </ul>
                                    <div className="dropdown-divider"></div>
                                    <a href="javascript:void(0)" className="dropdown-item text-center text-muted-dark readall">Mark all as read</a>
                                </div>
                            </div>
                            <div className="dropdown d-flex">
                                <a className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1" data-toggle="dropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                    <a className="dropdown-item" href="page-profile.html"><i className="dropdown-icon fa-solid fa-user"></i> Profile</a>
                                    <a className="dropdown-item" href="app-setting.html"><i className="dropdown-icon fa-solid fa-gear"></i> Settings</a>
                                    {/*<a className="dropdown-item" href="javascript:void(0)"><span className="float-right"><span className="badge badge-primary">6</span></span><i className="dropdown-icon fe fe-mail"></i> Inbox</a>*/}
                                    {/*<a className="dropdown-item" href="javascript:void(0)"><i className="dropdown-icon fe fe-send"></i> Message</a>*/}
                                    <div className="dropdown-divider"></div>
                                    <a className="dropdown-item" href="javascript:void(0)"><i className="dropdown-icon fa-solid fa-circle-question"></i> Need help?</a>
                                    <a className="dropdown-item" href="/auth/forgot-password"><i className="dropdown-icon fa-solid fa-lock-open"></i> Forgot Password</a>
                                    <a className="dropdown-item" href="/auth/login"><i className="dropdown-icon fa-solid fa-right-from-bracket"></i> Sign out</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}